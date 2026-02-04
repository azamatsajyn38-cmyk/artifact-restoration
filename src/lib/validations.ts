import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(6, "Пароль минимум 6 символов"),
});

export const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Имя минимум 2 символа"),
});

export const createProjectSchema = z.object({
  name: z.string().min(1, "Название обязательно").max(100),
  description: z.string().max(500).optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export const createArtifactSchema = z.object({
  projectId: z.string().min(1),
  originalImageUrl: z.string().min(1, "Изображение обязательно"),
});

export const promptTemplateSchema = z.object({
  name: z.string().min(1),
  template: z.string().min(10, "Шаблон минимум 10 символов"),
  description: z.string().optional(),
});

export const apiConfigSchema = z.object({
  serviceName: z.string().min(1),
  apiKey: z.string().min(1, "API ключ обязателен"),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().min(1).max(128000).optional(),
  extraConfig: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const analyzeArtifactSchema = z.object({
  imageData: z.string().min(1, "Данные изображения обязательны"),
});

export const restoreImageSchema = z.object({
  prompt: z.string().min(1, "Описание обязательно"),
});

export const generate3dSchema = z.object({
  prompt: z.string().min(1, "Описание для 3D обязательно"),
});
