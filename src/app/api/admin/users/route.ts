import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      _count: { select: { projects: true } },
    },
  });

  return NextResponse.json(users);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { userId, role } = body;

  if (!userId || !["ADMIN", "USER"].includes(role)) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  return NextResponse.json({ success: true });
}
