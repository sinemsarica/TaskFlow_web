"use client";
import { useState } from "react";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";
import type { ColumnType, CardType } from "@/types";
import { KanbanCard } from "./KanbanCard";

interface Props {
  column: ColumnType;
  onAddCard: (columnId: string, title: string) => Promise<void>;
  onDeleteColumn: (columnId: string) => Promise<void>;
  onOpenCard: (card: CardType, columnId: string) => void;
}

export function KanbanColumn({ column, onAddCard, onDeleteColumn, onOpenCard }: Props) {
  const [addingCard, setAddingCard] = useState(false);
  const [cardTitle, setCardTitle] = useState("");
  const [adding, setAdding] = useState(false);

  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: column.id });

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: { type: "column", column },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const cardIds = column.cards.map((c) => c.id);

  async function handleAddCard(e: React.FormEvent) {
    e.preventDefault();
    if (!cardTitle.trim()) return;
    setAdding(true);
    await onAddCard(column.id, cardTitle.trim());
    setCardTitle("");
    setAddingCard(false);
    setAdding(false);
  }

  return (
    <div
      ref={setSortableRef}
      style={style}
      className={`w-72 flex-shrink-0 flex flex-col max-h-full rounded-2xl border transition-colors ${
        isOver
          ? "border-[#6366f1]/50 bg-[#6366f1]/5"
          : "border-[#222] bg-[#141414]"
      } ${isDragging ? "shadow-glow" : ""}`}
    >
      {/* Column header */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-[#e8e8e8]">{column.title}</span>
          <span className="text-xs text-[#444] bg-[#1e1e1e] px-2 py-0.5 rounded-full">
            {column.cards.length}
          </span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDeleteColumn(column.id); }}
          className="text-[#333] hover:text-red-400 transition-colors p-1"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Cards */}
      <div
        ref={setDropRef}
        className="flex-1 overflow-y-auto px-3 pb-3 space-y-2 min-h-[40px]"
      >
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {column.cards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              columnId={column.id}
              onOpen={onOpenCard}
            />
          ))}
        </SortableContext>
      </div>

      {/* Add card */}
      <div className="px-3 pb-3">
        {addingCard ? (
          <form onSubmit={handleAddCard} className="animate-slide-in">
            <textarea
              autoFocus
              placeholder="Kart başlığı..."
              value={cardTitle}
              onChange={(e) => setCardTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAddCard(e as unknown as React.FormEvent);
                }
                if (e.key === "Escape") setAddingCard(false);
              }}
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-[#1a1a1a] border border-[#333] text-[#e8e8e8] placeholder:text-[#444] text-sm outline-none focus:border-[#6366f1] transition-colors resize-none mb-2"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={adding}
                className="flex-1 py-1.5 rounded-lg bg-[#6366f1] text-white text-xs font-medium hover:bg-[#4f46e5] transition-colors disabled:opacity-50"
              >
                {adding ? "..." : "Ekle"}
              </button>
              <button
                type="button"
                onClick={() => setAddingCard(false)}
                className="px-3 py-1.5 rounded-lg bg-[#222] text-[#666] text-xs hover:text-[#999] transition-colors"
              >
                İptal
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setAddingCard(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[#444] hover:text-[#666] hover:bg-[#1a1a1a] transition-all text-sm"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Kart ekle
          </button>
        )}
      </div>
    </div>
  );
}
