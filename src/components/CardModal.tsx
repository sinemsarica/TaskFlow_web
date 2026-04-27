"use client";
import { useState, useEffect, useRef } from "react";
import type { CardType, Priority } from "@/types";
import { LABEL_COLORS } from "@/types";

interface Props {
  card: CardType;
  columnId: string;
  onClose: () => void;
  onUpdate: (card: CardType) => void;
  onDelete: (id: string) => void;
}

const PRIORITIES: { value: Priority; label: string; color: string; bg: string }[] = [
  { value: "HIGH",   label: "🔴 Yüksek", color: "text-red-400",    bg: "bg-red-400/10 border-red-400/30"    },
  { value: "MEDIUM", label: "🟡 Orta",   color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/30" },
  { value: "LOW",    label: "🟢 Düşük",  color: "text-green-400",  bg: "bg-green-400/10 border-green-400/30"  },
];

export default function CardModal({ card, onClose, onUpdate, onDelete }: Props) {
  const [title, setTitle]             = useState(card.title);
  const [description, setDescription] = useState(card.description ?? "");
  const [priority, setPriority]       = useState<Priority | null>(card.priority);
  const [label, setLabel]             = useState<string | null>(card.label);
  const [saving, setSaving]           = useState(false);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);

  // Auto-save debounced
  useEffect(() => {
    const unchanged =
      title === card.title &&
      description === (card.description ?? "") &&
      priority === card.priority &&
      label === card.label;
    if (unchanged) return;

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      const res = await fetch(`/api/cards/${card.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || null,
          priority: priority ?? null,
          label: label ?? null,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        onUpdate(updated);
      }
      setSaving(false);
    }, 600);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, priority, label]);

  async function handleDelete() {
    if (!confirm("Bu kartı silmek istediğine emin misin?")) return;
    await fetch(`/api/cards/${card.id}`, { method: "DELETE" });
    onDelete(card.id);
  }

  function handleBackdrop(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      onClick={handleBackdrop}
    >
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl w-full max-w-lg shadow-2xl animate-slide-in">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#222]">
          <span className="text-xs text-[#555] font-medium uppercase tracking-wider">Kart Detayı</span>
          <div className="flex items-center gap-3">
            {saving && <span className="text-xs text-[#444]">Kaydediliyor...</span>}
            <button onClick={handleDelete} className="text-[#444] hover:text-red-400 transition-colors text-xs">
              Sil
            </button>
            <button onClick={onClose} className="text-[#444] hover:text-[#888] transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">

          {/* Title */}
          <div>
            <label className="text-xs text-[#555] uppercase tracking-wider mb-2 block">Başlık</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#111] border border-[#2a2a2a] focus:border-[#6366f1] text-[#e8e8e8] text-sm outline-none transition-colors"
            />
          </div>

          {/* Priority + Label row */}
          <div className="grid grid-cols-2 gap-4">

            {/* Priority */}
            <div>
              <label className="text-xs text-[#555] uppercase tracking-wider mb-2 block">Öncelik</label>
              <div className="space-y-1.5">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPriority(priority === p.value ? null : p.value)}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-all ${
                      priority === p.value
                        ? `${p.bg} ${p.color}`
                        : "border-[#222] text-[#555] hover:border-[#333] hover:text-[#777]"
                    }`}
                  >
                    {p.label}
                    {priority === p.value && (
                      <svg className="ml-auto" width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1.5 5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Label color */}
            <div>
              <label className="text-xs text-[#555] uppercase tracking-wider mb-2 block">Etiket</label>
              <div className="grid grid-cols-4 gap-2">
                {LABEL_COLORS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setLabel(label === c.id ? null : c.id)}
                    title={c.name}
                    className={`h-6 w-full rounded-md transition-all ${
                      label === c.id
                        ? "ring-2 ring-white ring-offset-1 ring-offset-[#1a1a1a] scale-110"
                        : "hover:scale-105 opacity-70 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
                {label && (
                  <button
                    onClick={() => setLabel(null)}
                    className="h-6 w-full rounded-md border border-[#333] text-[#555] hover:text-[#777] text-[10px] transition-colors"
                    title="Temizle"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Preview */}
              {(label || priority) && (
                <div className="mt-3 p-2 rounded-lg bg-[#111] border border-[#222]">
                  <p className="text-[10px] text-[#444] mb-1.5">Önizleme</p>
                  <div className="flex items-center gap-2">
                    {label && (
                      <span
                        className="inline-block h-1.5 w-8 rounded-full"
                        style={{ backgroundColor: LABEL_COLORS.find(c => c.id === label)?.hex }}
                      />
                    )}
                    {priority && (
                      <span className={`text-[10px] font-medium ${
                        priority === "HIGH" ? "text-red-400" :
                        priority === "MEDIUM" ? "text-yellow-400" : "text-green-400"
                      }`}>
                        {priority === "HIGH" ? "● Yüksek" : priority === "MEDIUM" ? "● Orta" : "● Düşük"}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-[#555] uppercase tracking-wider mb-2 block">Açıklama</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Kart açıklaması ekle..."
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl bg-[#111] border border-[#2a2a2a] focus:border-[#6366f1] text-[#e8e8e8] placeholder:text-[#333] text-sm outline-none transition-colors resize-none"
            />
          </div>
        </div>

        <div className="px-5 pb-4">
          <p className="text-xs text-[#333]">Değişiklikler otomatik kaydedilir</p>
        </div>
      </div>
    </div>
  );
}
