export type Priority = "LOW" | "MEDIUM" | "HIGH";

export const LABEL_COLORS = [
  { id: "red",    hex: "#ef4444", name: "Kırmızı"  },
  { id: "orange", hex: "#f97316", name: "Turuncu"  },
  { id: "yellow", hex: "#eab308", name: "Sarı"     },
  { id: "green",  hex: "#22c55e", name: "Yeşil"    },
  { id: "blue",   hex: "#3b82f6", name: "Mavi"     },
  { id: "purple", hex: "#a855f7", name: "Mor"      },
  { id: "pink",   hex: "#ec4899", name: "Pembe"    },
] as const;

export type LabelColor = typeof LABEL_COLORS[number]["id"];

export type CardType = {
  id: string;
  title: string;
  description: string | null;
  order: string;
  priority: Priority | null;
  label: string | null;
  columnId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ColumnType = {
  id: string;
  title: string;
  order: string;
  boardId: string;
  cards: CardType[];
};

export type BoardType = {
  id: string;
  title: string;
  columns: ColumnType[];
};

export type BoardSummary = {
  id: string;
  title: string;
  _count: { columns: number };
  createdAt: Date;
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
