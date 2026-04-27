"use client";
import { useState, useCallback } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { generateKeyBetween } from "fractional-indexing";
import type { BoardType, ColumnType, CardType } from "@/types";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCardDragOverlay } from "./KanbanCard";
import CardModal from "./CardModal";

export default function KanbanBoard({ initialBoard }: { initialBoard: BoardType }) {
  const [board, setBoard] = useState(initialBoard);
  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [activeColumn, setActiveColumn] = useState<ColumnType | null>(null);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [selectedCardColumnId, setSelectedCardColumnId] = useState<string | null>(null);
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  const columnIds = board.columns.map((c) => c.id);

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    if (active.data.current?.type === "card") {
      setActiveCard(active.data.current.card);
    }
    if (active.data.current?.type === "column") {
      setActiveColumn(active.data.current.column);
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (active.data.current?.type !== "card") return;

    const activeColId = active.data.current.columnId as string;
    const overType = over.data.current?.type;
    const overColId =
      overType === "card" ? (over.data.current?.columnId as string) : overId;

    if (activeColId === overColId) return;

    setBoard((prev) => {
      const newColumns = prev.columns.map((col) => {
        if (col.id === activeColId) {
          return { ...col, cards: col.cards.filter((c) => c.id !== activeId) };
        }
        if (col.id === overColId) {
          const card = prev.columns
            .flatMap((c) => c.cards)
            .find((c) => c.id === activeId);
          if (!card) return col;
          const overIndex =
            overType === "card"
              ? col.cards.findIndex((c) => c.id === overId)
              : col.cards.length;
          const updatedCards = [...col.cards];
          updatedCards.splice(overIndex >= 0 ? overIndex : col.cards.length, 0, {
            ...card,
            columnId: overColId,
          });
          return { ...col, cards: updatedCards };
        }
        return col;
      });
      return { ...prev, columns: newColumns };
    });
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveCard(null);
    setActiveColumn(null);
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Column reordering
    if (active.data.current?.type === "column") {
      if (activeId === overId) return;
      setBoard((prev) => {
        const oldIdx = prev.columns.findIndex((c) => c.id === activeId);
        const newIdx = prev.columns.findIndex((c) => c.id === overId);
        const reordered = arrayMove(prev.columns, oldIdx, newIdx);
        // Update orders
        const updated = reordered.map((col, i) => {
          const prev2 = i > 0 ? reordered[i - 1].order : null;
          const next2 = i < reordered.length - 1 ? reordered[i + 1].order : null;
          const newOrder = generateKeyBetween(i === 0 ? null : prev2, i === reordered.length - 1 ? null : next2);
          return { ...col, order: newOrder };
        });
        // Persist
        updated.forEach((col) => {
          fetch(`/api/columns/${col.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order: col.order }),
          });
        });
        return { ...prev, columns: updated };
      });
      return;
    }

    // Card reordering
    if (active.data.current?.type === "card") {
      const finalColumn = board.columns.find((col) =>
        col.cards.some((c) => c.id === activeId)
      );
      if (!finalColumn) return;

      const cards = finalColumn.cards;
      const cardIdx = cards.findIndex((c) => c.id === activeId);
      const prevOrder = cardIdx > 0 ? cards[cardIdx - 1].order : null;
      const nextOrder = cardIdx < cards.length - 1 ? cards[cardIdx + 1].order : null;
      const newOrder = generateKeyBetween(prevOrder, nextOrder);

      setBoard((prev) => ({
        ...prev,
        columns: prev.columns.map((col) => {
          if (col.id !== finalColumn.id) return col;
          return {
            ...col,
            cards: col.cards.map((c) =>
              c.id === activeId ? { ...c, order: newOrder } : c
            ),
          };
        }),
      }));

      await fetch(`/api/cards/${activeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: newOrder, columnId: finalColumn.id }),
      });
    }
  }

  async function addColumn(e: React.FormEvent) {
    e.preventDefault();
    if (!newColumnTitle.trim()) return;
    const res = await fetch(`/api/boards/${board.id}/columns`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newColumnTitle.trim() }),
    });
    if (res.ok) {
      const col = await res.json();
      setBoard((prev) => ({ ...prev, columns: [...prev.columns, col] }));
      setNewColumnTitle("");
      setAddingColumn(false);
    }
  }

  const addCard = useCallback(async (columnId: string, title: string) => {
    const res = await fetch(`/api/columns/${columnId}/cards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (res.ok) {
      const card = await res.json();
      setBoard((prev) => ({
        ...prev,
        columns: prev.columns.map((col) =>
          col.id === columnId ? { ...col, cards: [...col.cards, card] } : col
        ),
      }));
    }
  }, []);

  const deleteColumn = useCallback(async (columnId: string) => {
    await fetch(`/api/columns/${columnId}`, { method: "DELETE" });
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.filter((c) => c.id !== columnId),
    }));
  }, []);

  const openCard = useCallback((card: CardType, columnId: string) => {
    setSelectedCard(card);
    setSelectedCardColumnId(columnId);
  }, []);

  const updateCard = useCallback((updatedCard: CardType) => {
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.map((col) => ({
        ...col,
        cards: col.cards.map((c) => (c.id === updatedCard.id ? updatedCard : c)),
      })),
    }));
  }, []);

  const deleteCard = useCallback((cardId: string) => {
    setBoard((prev) => ({
      ...prev,
      columns: prev.columns.map((col) => ({
        ...col,
        cards: col.cards.filter((c) => c.id !== cardId),
      })),
    }));
  }, []);

  return (
    <div className="h-screen flex flex-col bg-[#0f0f0f] overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-[#1e1e1e] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-[#555] hover:text-[#888] transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <div className="w-px h-4 bg-[#222]" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#6366f1] flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="1" width="6" height="14" rx="1.5" fill="white" opacity="0.9"/>
                <rect x="9" y="1" width="6" height="9" rx="1.5" fill="white" opacity="0.6"/>
              </svg>
            </div>
            <h1 className="font-medium text-[#e8e8e8] text-sm">{board.title}</h1>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-xs text-[#444] hover:text-[#666] transition-colors"
        >
          Çıkış
        </button>
      </header>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 p-6 h-full items-start min-w-max">
            <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
              {board.columns.map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  onAddCard={addCard}
                  onDeleteColumn={deleteColumn}
                  onOpenCard={openCard}
                />
              ))}
            </SortableContext>

            {/* Add Column */}
            <div className="w-72 flex-shrink-0">
              {addingColumn ? (
                <form onSubmit={addColumn} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-3 animate-slide-in">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Sütun adı..."
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#111] border border-[#333] text-[#e8e8e8] placeholder:text-[#444] text-sm outline-none focus:border-[#6366f1] transition-colors mb-2"
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 py-1.5 rounded-lg bg-[#6366f1] text-white text-xs font-medium hover:bg-[#4f46e5] transition-colors">
                      Ekle
                    </button>
                    <button type="button" onClick={() => setAddingColumn(false)} className="px-3 py-1.5 rounded-lg bg-[#222] text-[#666] text-xs hover:text-[#999] transition-colors">
                      İptal
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setAddingColumn(true)}
                  className="w-full flex items-center gap-2 px-4 py-3 rounded-2xl border border-dashed border-[#2a2a2a] text-[#444] hover:text-[#666] hover:border-[#444] transition-all text-sm"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Sütun ekle
                </button>
              )}
            </div>
          </div>

          <DragOverlay>
            {activeCard && <KanbanCardDragOverlay card={activeCard} />}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Card Modal */}
      {selectedCard && selectedCardColumnId && (
        <CardModal
          card={selectedCard}
          columnId={selectedCardColumnId}
          onClose={() => { setSelectedCard(null); setSelectedCardColumnId(null); }}
          onUpdate={updateCard}
          onDelete={(id) => { deleteCard(id); setSelectedCard(null); setSelectedCardColumnId(null); }}
        />
      )}
    </div>
  );
}
