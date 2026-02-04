import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateProjectSchema } from "@/lib/validations";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await prisma.project.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      artifacts: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  }

  return NextResponse.json(project);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = updateProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const project = await prisma.project.updateMany({
    where: { id: params.id, userId: session.user.id },
    data: parsed.data,
  });

  if (project.count === 0) {
    return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await prisma.project.deleteMany({
    where: { id: params.id, userId: session.user.id },
  });

  if (project.count === 0) {
    return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
