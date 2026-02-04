import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createArtifactSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createArtifactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  // Verify project belongs to user
  const project = await prisma.project.findFirst({
    where: { id: parsed.data.projectId, userId: session.user.id },
  });

  if (!project) {
    return NextResponse.json({ error: "Проект не найден" }, { status: 404 });
  }

  const artifact = await prisma.artifact.create({
    data: {
      projectId: parsed.data.projectId,
      originalImageUrl: parsed.data.originalImageUrl,
    },
  });

  return NextResponse.json(artifact, { status: 201 });
}
