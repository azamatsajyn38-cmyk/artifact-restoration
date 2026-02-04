import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [userCount, projectCount, artifactCount] = await Promise.all([
    prisma.user.count(),
    prisma.project.count(),
    prisma.artifact.count(),
  ]);

  return NextResponse.json({ userCount, projectCount, artifactCount });
}
