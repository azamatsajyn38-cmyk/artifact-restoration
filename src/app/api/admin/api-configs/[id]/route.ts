import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();

  const config = await prisma.apiConfig.update({
    where: { id: params.id },
    data: {
      apiKey: body.apiKey,
      model: body.model,
      temperature: body.temperature ? parseFloat(body.temperature) : null,
      maxTokens: body.maxTokens ? parseInt(body.maxTokens) : null,
      extraConfig: body.extraConfig,
      isActive: body.isActive,
    },
  });

  return NextResponse.json(config);
}
