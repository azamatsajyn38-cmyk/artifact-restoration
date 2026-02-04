import type { AnalysisService, ImageRestorationService } from "./ai-service.interface";
import type { AnalysisResult, ImageGenerationResult } from "@/types";
import { withRetry } from "@/lib/retry";
import { fetchIPv4 } from "@/lib/fetch-ipv4";

interface GrokConfig {
  model?: string;
  imageModel?: string;
  temperature?: number;
  maxTokens?: number;
}

export class GrokService implements AnalysisService, ImageRestorationService {
  constructor(
    private apiKey: string,
    private config: GrokConfig = {}
  ) {}

  async analyze(imageData: string, promptTemplate: string): Promise<AnalysisResult> {
    const response = await withRetry(() => fetchIPv4("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model || "grok-2-vision-latest",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: promptTemplate },
              {
                type: "image_url",
                image_url: { url: imageData, detail: "high" },
              },
            ],
          },
        ],
        temperature: this.config.temperature ?? 0.7,
        max_tokens: this.config.maxTokens || 2000,
      }),
    }));

    const data = await response.json();
    if (!response.ok || data.error) {
      const msg = typeof data.error === "string"
        ? data.error
        : data.error?.message || data.code || `Grok API error: ${response.status}`;
      throw new Error(msg);
    }

    const text = data.choices[0].message.content;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse Grok response");

    return JSON.parse(jsonMatch[0]);
  }

  async restore(prompt: string, promptTemplate: string): Promise<ImageGenerationResult> {
    const finalPrompt = promptTemplate.replace("{{prompt}}", prompt);

    const response = await withRetry(() => fetchIPv4("https://api.x.ai/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.imageModel || "grok-2-image",
        prompt: finalPrompt,
        n: 1,
      }),
    }));

    const data = await response.json();
    if (!response.ok || data.error) {
      const msg = typeof data.error === "string"
        ? data.error
        : data.error?.message || data.code || `Grok image generation error: ${response.status}`;
      throw new Error(msg);
    }

    // Grok returns base64 in data[0].b64_json or url in data[0].url
    const imageUrl = data.data[0].url || `data:image/png;base64,${data.data[0].b64_json}`;

    return { imageUrl };
  }
}
