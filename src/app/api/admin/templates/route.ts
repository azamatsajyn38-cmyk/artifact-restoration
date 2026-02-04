import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { promptTemplateSchema } from "@/lib/validations";

export async function GET() {
  const templates = await prisma.promptTemplate.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(templates);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = promptTemplateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const template = await prisma.promptTemplate.create({
    data: parsed.data,
  });

  return NextResponse.json(template, { status: 201 });
}
