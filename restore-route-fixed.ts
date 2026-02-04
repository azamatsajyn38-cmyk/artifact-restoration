import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRestorationService, getPromptTemplate } from "@/services/service-registry";
import { restoreImageSchema } from "@/lib/validations";
import { classifyApiError } from "@/lib/api-error";

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
    return NextResponse.json({ error: "Артефакт не найден" }, { status: 404 });
  }

  if (!artifact.originalImageUrl) {
    return NextResponse.json({ 
      error: "URL оригинального изображения не найден" 
    }, { status: 404 });
  }

  const body = await req.json();
  const parsed = restoreImageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Описание обязательно" },
      { status: 400 }
    );
  }

  try {
    const service = await getRestorationService();
    const template = await getPromptTemplate("restoration");

    // Передаём URL оригинального изображения в restore
    const result = await service.restore(
      parsed.data.prompt, 
      template,
      artifact.originalImageUrl // Передаём URL из базы данных
    );

    await prisma.artifact.update({
      where: { id: params.id },
      data: { restoredImageUrl: result.imageUrl },
    });

    return NextResponse.json({ success: true, imageUrl: result.imageUrl });
  } catch (error: any) {
    console.error("[RESTORE ERROR]", error);
    const { status, message } = classifyApiError(error);
    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}
