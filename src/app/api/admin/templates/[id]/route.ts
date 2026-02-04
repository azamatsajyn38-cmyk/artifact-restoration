import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { promptTemplateSchema } from "@/lib/validations";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const template = await prisma.promptTemplate.findUnique({
    where: { id: params.id },
  });

  if (!template) {
    return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  }

  return NextResponse.json(template);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const parsed = promptTemplateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const template = await prisma.promptTemplate.update({
    where: { id: params.id },
    data: parsed.data,
  });

  return NextResponse.json(template);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.promptTemplate.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ success: true });
}
