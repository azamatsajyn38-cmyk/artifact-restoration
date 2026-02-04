import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getModelGenerationService, getPromptTemplate } from "@/services/service-registry";
import { classifyApiError } from "@/lib/api-error";
import { cacheModelFile } from "@/lib/model-cache";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const artifact = await prisma.artifact.findFirst({
    where: { id: params.id, project: { userId: session.user.id } },
  });

  if (!artifact) {
    return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  }

  const body = await req.json();
  const { prompt, imageData } = body;

  if (!prompt && !imageData) {
    return NextResponse.json(
      { error: "Необходимо указать prompt или imageData" },
      { status: 400 }
    );
  }

  try {
    const service = await getModelGenerationService();
    let result;

    if (imageData) {
      result = await service.generateFromImage(imageData);
    } else {
      const template = await getPromptTemplate("3d_generation");
      result = await service.generate(prompt, template);
    }

    await prisma.artifact.update({
      where: { id: params.id },
      data: { meshyTaskId: result.taskId, meshyStatus: "PENDING" },
    });

    return NextResponse.json({ success: true, taskId: result.taskId });
  } catch (error: any) {
    console.error("[GENERATE-3D ERROR]", error);
    const { status, message } = classifyApiError(error);
    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const artifact = await prisma.artifact.findFirst({
    where: { id: params.id, project: { userId: session.user.id } },
  });

  if (!artifact?.meshyTaskId) {
    return NextResponse.json({ error: "Задача не найдена" }, { status: 404 });
  }

  try {
    const service = await getModelGenerationService();
    const result = await service.checkStatus(artifact.meshyTaskId);

    // Если генерация завершена — кэшируем файлы локально
    if (result.status === "SUCCEEDED" && result.modelUrls) {
      const cachedUrls: Record<string, string> = {};

      try {
        if (result.modelUrls.glb) {
          cachedUrls.glb = await cacheModelFile(params.id, result.modelUrls.glb, "model.glb");
        }
        if (result.modelUrls.fbx) {
          cachedUrls.fbx = await cacheModelFile(params.id, result.modelUrls.fbx, "model.fbx");
        }
        if (result.modelUrls.thumbnail) {
          cachedUrls.thumbnail = await cacheModelFile(params.id, result.modelUrls.thumbnail, "thumbnail.png");
        }
      } catch (cacheErr) {
        // Если кэширование не удалось — используем оригинальные URL
        console.warn("[MODEL-CACHE] Failed to cache:", cacheErr);
        if (result.modelUrls.glb) cachedUrls.glb = cachedUrls.glb || result.modelUrls.glb;
        if (result.modelUrls.fbx) cachedUrls.fbx = cachedUrls.fbx || result.modelUrls.fbx;
        if (result.modelUrls.thumbnail) cachedUrls.thumbnail = cachedUrls.thumbnail || result.modelUrls.thumbnail;
      }

      result.modelUrls = cachedUrls as typeof result.modelUrls;

      await prisma.artifact.update({
        where: { id: params.id },
        data: {
          meshyStatus: result.status,
          modelUrls: JSON.stringify(cachedUrls),
        },
      });
    } else {
      await prisma.artifact.update({
        where: { id: params.id },
        data: {
          meshyStatus: result.status,
        },
      });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("[3D-STATUS ERROR]", error);
    const { status, message } = classifyApiError(error);
    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}
