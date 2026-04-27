import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-satoshi)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        bg: "#0f0f0f",
        surface: "#1a1a1a",
        border: "#2a2a2a",
        accent: "#6366f1",
        "accent-hover": "#4f46e5",
        muted: "#666",
        text: "#e8e8e8",
        "text-muted": "#999",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.5)",
        glow: "0 0 20px rgba(99,102,241,0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
