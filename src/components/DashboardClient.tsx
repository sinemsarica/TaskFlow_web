"use client";
import { useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";

type Board = {
  id: string;
  title: string;
  createdAt: Date;
  _count: { columns: number };
};

export default function DashboardClient({
  initialBoards,
  userName,
}: {
  initialBoards: Board[];
  userName: string;
}) {
  const [boards, setBoards] = useState(initialBoards);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function createBoard(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);

    const res = await fetch("/api/boards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle.trim() }),
    });

    if (res.ok) {
      const board = await res.json();
      setBoards((prev) => [{ ...board, _count: { columns: 0 } }, ...prev]);
      setNewTitle("");
      setShowForm(false);
    }
    setCreating(false);
  }

  async function deleteBoard(id: string) {
    if (!confirm("Bu board silinecek. Emin misin?")) return;
    await fetch(`/api/boards/${id}`, { method: "DELETE" });
    setBoards((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Header */}
      <header className="border-b border-[#1e1e1e] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#6366f1] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="1" width="6" height="14" rx="1.5" fill="white" opacity="0.9"/>
                <rect x="9" y="1" width="6" height="9" rx="1.5" fill="white" opacity="0.6"/>
              </svg>
            </div>
            <span className="font-semibold text-white">TaskFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#666]">Merhaba, {userName}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-sm text-[#555] hover:text-[#999] transition-colors"
            >
              Çıkış
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white">Board&apos;larım</h1>
            <p className="text-[#555] text-sm mt-1">{boards.length} board</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6366f1] hover:bg-[#4f46e5] text-white text-sm font-medium transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Yeni Board
          </button>
        </div>

        {/* New board form */}
        {showForm && (
          <div className="mb-6 animate-fade-in">
            <form onSubmit={createBoard} className="flex gap-3 max-w-md">
              <input
                autoFocus
                type="text"
                placeholder="Board adı..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] focus:border-[#6366f1] text-[#e8e8e8] placeholder:text-[#444] text-sm outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2.5 rounded-xl bg-[#6366f1] hover:bg-[#4f46e5] text-white text-sm font-medium transition-colors disabled:opacity-50"
              >
                {creating ? "..." : "Oluştur"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-3 py-2.5 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-[#666] hover:text-[#999] text-sm transition-colors"
              >
                İptal
              </button>
            </form>
          </div>
        )}

        {/* Boards grid */}
        {boards.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-[#555] font-medium mb-2">Henüz board yok</h3>
            <p className="text-[#444] text-sm">Yukarıdaki butona tıklayarak ilk board&apos;unu oluştur</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards.map((board) => (
              <div
                key={board.id}
                className="group relative bg-[#1a1a1a] border border-[#222] rounded-2xl p-5 hover:border-[#333] transition-all animate-fade-in"
              >
                <Link href={`/board/${board.id}`} className="block">
                  <h3 className="font-medium text-[#e8e8e8] mb-2 group-hover:text-white transition-colors">
                    {board.title}
                  </h3>
                  <p className="text-xs text-[#444]">
                    {board._count.columns} sütun
                  </p>
                </Link>
                <button
                  onClick={() => deleteBoard(board.id)}
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-[#444] hover:text-red-400 transition-all p-1"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
