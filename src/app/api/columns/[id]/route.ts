import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const column = await prisma.column.update({
    where: { id: params.id },
    data: { ...(body.title && { title: body.title }), ...(body.order && { order: body.order }) },
  });

  return NextResponse.json(column);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.column.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
