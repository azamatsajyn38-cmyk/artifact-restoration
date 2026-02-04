import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const artifact = await prisma.artifact.findFirst({
    where: {
      id: params.id,
      project: { userId: session.user.id },
    },
    include: { project: true },
  });

  if (!artifact) {
    return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  }

  return NextResponse.json(artifact);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const artifact = await prisma.artifact.findFirst({
    where: {
      id: params.id,
      project: { userId: session.user.id },
    },
  });

  if (!artifact) {
    return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  }

  await prisma.artifact.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
