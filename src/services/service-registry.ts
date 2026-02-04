import { prisma } from "@/lib/prisma";
import { OpenAIService } from "./openai.service";
import { GeminiService } from "./gemini.service";
import { GrokService } from "./grok.service";
import { MeshyService } from "./meshy.service";
import type { AnalysisService, ImageRestorationService, ModelGenerationService } from "./ai-service.interface";

// Priority order for analysis: openai -> gemini -> grok
// Uses the first active provider with a configured API key
const ANALYSIS_PROVIDERS = ["openai", "gemini", "grok"] as const;

// Priority order for image restoration: openai -> grok
// (Gemini does not have image generation)
const RESTORATION_PROVIDERS = ["openai", "grok"] as const;

async function getActiveConfig(serviceNames: readonly string[]) {
  const configs = await prisma.apiConfig.findMany({
    where: {
      serviceName: { in: [...serviceNames] },
      isActive: true,
    },
  });

  // Return first active config with a non-empty API key, in priority order
  for (const name of serviceNames) {
    const config = configs.find((c) => c.serviceName === name && c.apiKey);
    if (config) return config;
  }

  return null;
}

function buildAnalysisService(config: { serviceName: string; apiKey: string; model: string | null; temperature: number | null; maxTokens: number | null; extraConfig: string | null }): AnalysisService {
  const extra = config.extraConfig ? JSON.parse(config.extraConfig) : {};

  switch (config.serviceName) {
    case "gemini":
      return new GeminiService(config.apiKey, {
        model: config.model || undefined,
        temperature: config.temperature || undefined,
        maxTokens: config.maxTokens || undefined,
      });

    case "grok":
      return new GrokService(config.apiKey, {
        model: config.model || undefined,
        temperature: config.temperature || undefined,
        maxTokens: config.maxTokens || undefined,
        ...extra,
      });

    case "openai":
    default:
      return new OpenAIService(config.apiKey, {
        model: config.model || undefined,
        temperature: config.temperature || undefined,
        maxTokens: config.maxTokens || undefined,
        ...extra,
      });
  }
}

function buildRestorationService(config: { serviceName: string; apiKey: string; extraConfig: string | null }): ImageRestorationService {
  const extra = config.extraConfig ? JSON.parse(config.extraConfig) : {};

  switch (config.serviceName) {
    case "grok":
      return new GrokService(config.apiKey, {
        imageModel: extra.imageModel,
        ...extra,
      });

    case "openai":
    default:
      return new OpenAIService(config.apiKey, {
        imageSize: extra.imageSize,
        imageQuality: extra.imageQuality,
      });
  }
}

export async function getAnalysisService(): Promise<AnalysisService> {
  const config = await getActiveConfig(ANALYSIS_PROVIDERS);

  if (!config) {
    throw new Error(
      "Ни один провайдер для анализа не настроен. " +
      "Администратор должен указать API-ключ для OpenAI, Gemini или Grok."
    );
  }

  return buildAnalysisService(config);
}

export async function getRestorationService(): Promise<ImageRestorationService> {
  const config = await getActiveConfig(RESTORATION_PROVIDERS);

  if (!config) {
    throw new Error(
      "Ни один провайдер для реставрации не настроен. " +
      "Администратор должен указать API-ключ для OpenAI или Grok."
    );
  }

  return buildRestorationService(config);
}

export async function getModelGenerationService(): Promise<ModelGenerationService> {
  const config = await prisma.apiConfig.findUnique({
    where: { serviceName: "meshy" },
  });

  if (!config || !config.isActive || !config.apiKey) {
    throw new Error("Meshy AI не настроен. Администратор должен указать API-ключ.");
  }

  const extra = config.extraConfig ? JSON.parse(config.extraConfig) : {};

  return new MeshyService(config.apiKey, {
    artStyle: extra.artStyle,
    negativePrompt: extra.negativePrompt,
  });
}

export async function getPromptTemplate(name: string): Promise<string> {
  const template = await prisma.promptTemplate.findUnique({
    where: { name },
  });

  if (!template) {
    throw new Error(`Шаблон промпта "${name}" не найден`);
  }

  return template.template;
}
