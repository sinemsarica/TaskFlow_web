import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import KanbanBoard from "@/components/KanbanBoard";

export default async function BoardPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const board = await prisma.board.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      columns: {
        orderBy: { order: "asc" },
        include: { cards: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!board) notFound();

  return <KanbanBoard initialBoard={board} />;
}
