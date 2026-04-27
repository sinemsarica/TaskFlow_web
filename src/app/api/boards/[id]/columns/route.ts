import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateKeyBetween } from "fractional-indexing";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: "Başlık zorunlu" }, { status: 400 });

  // Get last column order
  const lastColumn = await prisma.column.findFirst({
    where: { boardId: params.id },
    orderBy: { order: "desc" },
  });

  const order = generateKeyBetween(lastColumn?.order ?? null, null);

  const column = await prisma.column.create({
    data: { title: title.trim(), boardId: params.id, order },
    include: { cards: true },
  });

  return NextResponse.json(column, { status: 201 });
}
