import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const boards = await prisma.board.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { columns: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(boards);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: "Başlık zorunlu" }, { status: 400 });

  const board = await prisma.board.create({
    data: { title: title.trim(), userId: session.user.id },
  });

  return NextResponse.json(board, { status: 201 });
}
