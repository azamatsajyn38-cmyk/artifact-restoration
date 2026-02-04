import type { ModelGenerationService } from "./ai-service.interface";
import type { ModelGenerationResult, ModelStatusResult } from "@/types";
import { withRetry } from "@/lib/retry";
import { fetchIPv4 } from "@/lib/fetch-ipv4";

interface MeshyConfig {
  artStyle?: string;
  negativePrompt?: string;
}

// Префикс для задач image-to-3d, чтобы checkStatus знал какой endpoint использовать
const IMAGE_TASK_PREFIX = "img:";

export class MeshyService implements ModelGenerationService {
  constructor(
    private apiKey: string,
    private config: MeshyConfig = {}
  ) {}

  async generate(prompt: string, promptTemplate: string): Promise<ModelGenerationResult> {
    const finalPrompt = promptTemplate.replace("{{prompt}}", prompt);

    const response = await withRetry(() => fetchIPv4("https://api.meshy.ai/v2/text-to-3d", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mode: "preview",
        prompt: finalPrompt,
        art_style: this.config.artStyle || "realistic",
        negative_prompt: this.config.negativePrompt || "low quality, blurry, distorted",
      }),
    }));

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || data.message || `Meshy API error: ${response.status}`);
    }

    return { taskId: data.result };
  }

  async generateFromImage(imageUrl: string): Promise<ModelGenerationResult> {
    const response = await withRetry(() => fetchIPv4("https://api.meshy.ai/v1/image-to-3d", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_url: imageUrl,
        enable_pbr: true,
      }),
    }));

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || data.message || `Meshy API error: ${response.status}`);
    }

    return { taskId: `${IMAGE_TASK_PREFIX}${data.result}` };
  }

  async checkStatus(taskId: string): Promise<ModelStatusResult> {
    const isImage = taskId.startsWith(IMAGE_TASK_PREFIX);
    const realId = isImage ? taskId.slice(IMAGE_TASK_PREFIX.length) : taskId;
    const version = isImage ? "v1" : "v2";
    const endpoint = isImage ? "image-to-3d" : "text-to-3d";

    const response = await withRetry(() => fetchIPv4(`https://api.meshy.ai/${version}/${endpoint}/${realId}`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    }));

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || data.message || `Meshy API error: ${response.status}`);
    }

    return {
      status: data.status,
      modelUrls:
        data.status === "SUCCEEDED"
          ? {
              glb: data.model_urls?.glb,
              fbx: data.model_urls?.fbx,
              thumbnail: data.thumbnail_url,
            }
          : undefined,
      progress: data.progress,
    };
  }
}
