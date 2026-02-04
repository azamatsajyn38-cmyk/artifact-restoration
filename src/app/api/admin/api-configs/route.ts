import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiConfigSchema } from "@/lib/validations";

export async function GET() {
  const configs = await prisma.apiConfig.findMany({
    orderBy: { serviceName: "asc" },
  });
  return NextResponse.json(configs);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = apiConfigSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const config = await prisma.apiConfig.create({
    data: parsed.data,
  });

  return NextResponse.json(config, { status: 201 });
}
