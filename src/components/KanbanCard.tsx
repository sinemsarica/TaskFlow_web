"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CardType, Priority } from "@/types";
import { LABEL_COLORS } from "@/types";

interface Props {
  card: CardType;
  columnId: string;
  onOpen: (card: CardType, columnId: string) => void;
}

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; dot: string }> = {
  HIGH:   { label: "Yüksek", color: "text-red-400",    dot: "bg-red-400"    },
  MEDIUM: { label: "Orta",   color: "text-yellow-400", dot: "bg-yellow-400" },
  LOW:    { label: "Düşük",  color: "text-green-400",  dot: "bg-green-400"  },
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  const cfg = PRIORITY_CONFIG[priority];
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export function LabelStrip({ label }: { label: string }) {
  const color = LABEL_COLORS.find((c) => c.id === label);
  if (!color) return null;
  return (
    <span
      className="inline-block h-1.5 w-8 rounded-full"
      style={{ backgroundColor: color.hex }}
      title={color.name}
    />
  );
}

export function KanbanCard({ card, columnId, onOpen }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: "card", card, columnId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onOpen(card, columnId)}
      className={`group bg-[#1e1e1e] border rounded-xl px-3 py-2.5 cursor-pointer select-none transition-all ${
        isDragging
          ? "opacity-40 border-[#6366f1]/50 shadow-glow scale-95"
          : "border-[#2a2a2a] hover:border-[#383838] hover:bg-[#222] hover:shadow-card-hover"
      }`}
    >
      {(card.label || card.priority) && (
        <div className="flex items-center gap-2 mb-2">
          {card.label && <LabelStrip label={card.label} />}
          {card.priority && <PriorityBadge priority={card.priority} />}
        </div>
      )}
      <p className="text-sm text-[#d4d4d4] group-hover:text-white transition-colors leading-snug">
        {card.title}
      </p>
      {card.description && (
        <p className="text-xs text-[#555] mt-1.5 line-clamp-2">{card.description}</p>
      )}
    </div>
  );
}

export function KanbanCardDragOverlay({ card }: { card: CardType }) {
  return (
    <div className="bg-[#252525] border border-[#6366f1]/50 rounded-xl px-3 py-2.5 shadow-glow w-72 rotate-2">
      {(card.label || card.priority) && (
        <div className="flex items-center gap-2 mb-2">
          {card.label && <LabelStrip label={card.label} />}
          {card.priority && <PriorityBadge priority={card.priority} />}
        </div>
      )}
      <p className="text-sm text-white leading-snug">{card.title}</p>
      {card.description && (
        <p className="text-xs text-[#666] mt-1.5 line-clamp-2">{card.description}</p>
      )}
    </div>
  );
}
