import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const board = await prisma.board.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      columns: {
        orderBy: { order: "asc" },
        include: {
          cards: { orderBy: { order: "asc" } },
        },
      },
    },
  });

  if (!board) return NextResponse.json({ error: "Board bulunamadı" }, { status: 404 });
  return NextResponse.json(board);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.board.deleteMany({ where: { id: params.id, userId: session.user.id } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title } = await req.json();
  const board = await prisma.board.updateMany({
    where: { id: params.id, userId: session.user.id },
    data: { title },
  });

  return NextResponse.json(board);
}
