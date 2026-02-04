import type { AnalysisService } from "./ai-service.interface";
import type { AnalysisResult } from "@/types";
import { withRetry } from "@/lib/retry";
import { fetchIPv4 } from "@/lib/fetch-ipv4";

interface GeminiConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export class GeminiService implements AnalysisService {
  constructor(
    private apiKey: string,
    private config: GeminiConfig = {}
  ) {}

  async analyze(imageData: string, promptTemplate: string): Promise<AnalysisResult> {
    const model = this.config.model || "gemini-2.0-flash";

    // Extract base64 data and mime type from data URL
    const match = imageData.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!match) throw new Error("Invalid image data format");

    const mimeType = match[1];
    const base64Data = match[2];

    const response = await withRetry(() => fetchIPv4(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: promptTemplate },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: this.config.temperature ?? 0.7,
            maxOutputTokens: this.config.maxTokens || 2000,
            responseMimeType: "application/json",
          },
        }),
      }
    ));

    const data = await response.json();

    if (data.error) {
      const code = data.error.code;
      if (code === 429) {
        throw new Error("Gemini: дневная квота исчерпана. Подождите до завтра или включите оплату в Google Cloud Console.");
      }
      if (code === 403 || code === 401) {
        throw new Error("Gemini: API-ключ невалиден или заблокирован. Проверьте ключ в админке.");
      }
      throw new Error(data.error.message || "Gemini API error");
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Empty response from Gemini");

    return JSON.parse(text);
  }
}
