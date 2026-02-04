import type { AnalysisResult, ImageGenerationResult, ModelGenerationResult, ModelStatusResult } from "@/types";

export interface AnalysisService {
  analyze(imageData: string, promptTemplate: string): Promise<AnalysisResult>;
}

export interface ImageRestorationService {
  restore(prompt: string, promptTemplate: string): Promise<ImageGenerationResult>;
}

export interface ModelGenerationService {
  generate(prompt: string, promptTemplate: string): Promise<ModelGenerationResult>;
  generateFromImage(imageUrl: string): Promise<ModelGenerationResult>;
  checkStatus(taskId: string): Promise<ModelStatusResult>;
}
