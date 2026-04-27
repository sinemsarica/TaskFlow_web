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

  const lastCard = await prisma.card.findFirst({
    where: { columnId: params.id },
    orderBy: { order: "desc" },
  });

  const order = generateKeyBetween(lastCard?.order ?? null, null);

  const card = await prisma.card.create({
    data: { title: title.trim(), columnId: params.id, order },
  });

  return NextResponse.json(card, { status: 201 });
}
