import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: Record<string, any> = {};

  if (body.title !== undefined) updateData.title = body.title;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.order !== undefined) updateData.order = body.order;
  if (body.columnId !== undefined) updateData.columnId = body.columnId;
  if (body.labels !== undefined) updateData.labels = body.labels;
  if (body.assignee !== undefined) updateData.assignee = body.assignee;

  const card = await prisma.card.update({
    where: { id: params.id },
    data: updateData,
  });

  return NextResponse.json(card);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.card.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
