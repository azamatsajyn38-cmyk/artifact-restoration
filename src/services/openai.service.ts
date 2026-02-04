import type { AnalysisService, ImageRestorationService } from "./ai-service.interface";
import type { AnalysisResult, ImageGenerationResult } from "@/types";
import { withRetry } from "@/lib/retry";
import { fetchIPv4 } from "@/lib/fetch-ipv4";

interface OpenAIConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  imageSize?: string;
  imageQuality?: string;
}

export class OpenAIService implements AnalysisService, ImageRestorationService {
  private originalImageUrl: string = "";

  constructor(
    private apiKey: string,
    private config: OpenAIConfig = {}
  ) {}

  async analyze(imageData: string, promptTemplate: string): Promise<AnalysisResult> {
    // Сохраняем URL оригинального фото для использования в restore
    this.originalImageUrl = imageData;

    const response = await withRetry(() => fetchIPv4("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model || "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: promptTemplate },
              { type: "image_url", image_url: { url: imageData, detail: "high" } },
            ],
          },
        ],
        max_tokens: this.config.maxTokens || 2000,
        temperature: this.config.temperature ?? 0.7,
        response_format: { type: "json_object" },
      }),
    }));

    const data = await response.json();
    if (!response.ok || data.error) {
      const msg = typeof data.error === "string"
        ? data.error
        : data.error?.message || `OpenAI API error: ${response.status}`;
      throw new Error(msg);
    }

    const text = data.choices[0].message.content;
    return JSON.parse(text);
  }

  async restore(prompt: string, promptTemplate: string, originalImageUrl?: string): Promise<ImageGenerationResult> {
    // Используем переданный URL или сохранённый из analyze()
    const imageUrl = originalImageUrl || this.originalImageUrl;
    
    if (!imageUrl) {
      throw new Error("Original image URL is required for restoration. Please analyze the image first or provide the URL.");
    }

    // Улучшенный промпт с контекстом оригинального изображения
    const enhancedPrompt = `
Based on the artifact shown in the reference image, create a RESTORED version with these specifications:

Artifact description: ${prompt}

Requirements:
- Maintain the EXACT same shape, proportions, and style as the original artifact
- Preserve all decorative patterns and design elements
- Show it in PERFECT restored condition (no cracks, chips, or damage)
- Place ONLY the artifact on a pure solid white background (#FFFFFF)
- No other objects, no hands, no people, no shadows
- Professional museum product photography
- Centered composition, well-lit, high detail
- The artifact should look identical to the original but completely restored

Additional context from template: ${promptTemplate.replace("{{prompt}}", "")}
`.trim();

    // Шаг 1: GPT-4o анализирует оригинальное фото и создаёт детальное описание
    const response = await withRetry(() => fetchIPv4("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model || "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { 
                type: "text", 
                text: `Look at this artifact image carefully and create a detailed description for DALL-E 3 to generate a perfectly restored version. ${enhancedPrompt}` 
              },
              { 
                type: "image_url", 
                image_url: { url: imageUrl, detail: "high" } 
              },
            ],
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    }));

    const analysisData = await response.json();
    if (!response.ok || analysisData.error) {
      const msg = typeof analysisData.error === "string"
        ? analysisData.error
        : analysisData.error?.message || `OpenAI API error: ${response.status}`;
      throw new Error(msg);
    }

    // Получаем детальное описание от GPT-4o
    const detailedDescription = analysisData.choices[0].message.content;

    console.log("[DALL-E PROMPT]", detailedDescription);

    // Шаг 2: DALL-E 3 генерирует восстановленное изображение
    const imageResponse = await withRetry(() => fetchIPv4("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: `${detailedDescription}

CRITICAL REQUIREMENTS:
- Pure white background ONLY (#FFFFFF)
- NO other objects in frame
- NO hands, NO people
- Isolated artifact centered
- Professional product photography
- High quality museum documentation style`,
        n: 1,
        size: this.config.imageSize || "1024x1024",
        quality: this.config.imageQuality || "standard",
      }),
    }));

    const imageData = await imageResponse.json();
    if (!imageResponse.ok || imageData.error) {
      const msg = typeof imageData.error === "string"
        ? imageData.error
        : imageData.error?.message || `OpenAI image error: ${imageResponse.status}`;
      throw new Error(msg);
    }

    return {
      imageUrl: imageData.data[0].url,
      revisedPrompt: imageData.data[0].revised_prompt,
    };
  }
}
