import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAnalysisService, getPromptTemplate } from "@/services/service-registry";
import { analyzeArtifactSchema } from "@/lib/validations";
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
    return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = analyzeArtifactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Данные изображения обязательны" },
      { status: 400 }
    );
  }

  try {
    const service = await getAnalysisService();
    const template = await getPromptTemplate("analysis");
    const analysis = await service.analyze(parsed.data.imageData, template);

    await prisma.artifact.update({
      where: { id: params.id },
      data: { analysisResult: JSON.stringify(analysis) },
    });

    return NextResponse.json({ success: true, analysis });
  } catch (error: any) {
    console.error("[ANALYZE ERROR]", error);
    const { status, message } = classifyApiError(error);
    return NextResponse.json(
      { success: false, error: message },
      { status }
    );
  }
}
