import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 12);

  await prisma.user.upsert({
    where: { email: "admin@artifact-restoration.local" },
    update: {},
    create: {
      email: "admin@artifact-restoration.local",
      name: "Администратор",
      hashedPassword,
      role: "ADMIN",
    },
  });

  await prisma.promptTemplate.upsert({
    where: { name: "analysis" },
    update: {},
    create: {
      name: "analysis",
      description: "Промпт для анализа артефакта через GPT-4o Vision",
      template: `Проанализируй этот артефакт. Ответь СТРОГО в JSON формате без markdown:
{
  "type": "тип артефакта (амфора, ваза и т.д.)",
  "period": "исторический период",
  "culture": "культура",
  "material": "материал",
  "purpose": "назначение",
  "dimensions": {
    "height": число_в_см,
    "baseWidth": число_в_см,
    "topWidth": число_в_см
  },
  "shapeProfile": "convex или linear или concave",
  "condition": "состояние",
  "restoration": "рекомендации по реставрации",
  "description": "подробное описание"
}`,
    },
  });

  await prisma.promptTemplate.upsert({
    where: { name: "restoration" },
    update: {},
    create: {
      name: "restoration",
      description: "Промпт для реставрации изображения через DALL-E 3",
      template:
        "Professional archaeological restoration: {{prompt}}, completely restored, JUST the artifact ALONE on solid white background #FFFFFF, nothing else in frame, object only, centered, professional product shot, NO hands.",
    },
  });

  await prisma.promptTemplate.upsert({
    where: { name: "3d_generation" },
    update: {},
    create: {
      name: "3d_generation",
      description: "Промпт для генерации 3D модели через Meshy AI",
      template:
        "{{prompt}}, ancient artifact, museum quality, highly detailed, realistic",
    },
  });

  await prisma.apiConfig.upsert({
    where: { serviceName: "openai" },
    update: {},
    create: {
      serviceName: "openai",
      apiKey: "",
      model: "gpt-4o",
      temperature: 0.7,
      maxTokens: 2000,
      extraConfig: JSON.stringify({
        imageSize: "1024x1024",
        imageQuality: "standard",
      }),
    },
  });

  await prisma.apiConfig.upsert({
    where: { serviceName: "gemini" },
    update: {},
    create: {
      serviceName: "gemini",
      apiKey: "",
      model: "gemini-2.0-flash",
      temperature: 0.7,
      maxTokens: 2000,
      isActive: false,
    },
  });

  await prisma.apiConfig.upsert({
    where: { serviceName: "grok" },
    update: {},
    create: {
      serviceName: "grok",
      apiKey: "",
      model: "grok-2-vision-latest",
      temperature: 0.7,
      maxTokens: 2000,
      extraConfig: JSON.stringify({
        imageModel: "grok-2-image",
      }),
      isActive: false,
    },
  });

  await prisma.apiConfig.upsert({
    where: { serviceName: "meshy" },
    update: {},
    create: {
      serviceName: "meshy",
      apiKey: "",
      extraConfig: JSON.stringify({
        artStyle: "realistic",
        negativePrompt: "low quality, blurry, distorted",
      }),
    },
  });

  console.log("Database seeded successfully.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
