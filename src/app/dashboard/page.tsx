import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardClient from "@/components/DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const boards = await prisma.board.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { columns: true } } },
    orderBy: { createdAt: "desc" },
  });

  return <DashboardClient initialBoards={boards} userName={session.user.name ?? ""} />;
}
