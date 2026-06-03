import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./stores/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1440px" },
    },
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-muted": "var(--surface-muted)",
        "surface-inverse": "var(--surface-inverse)",
        ink: "var(--ink)",
        "ink-2": "var(--ink-2)",
        "ink-3": "var(--ink-3)",
        "ink-4": "var(--ink-4)",
        line: "var(--line)",
        "line-strong": "var(--line-strong)",
        focus: "var(--focus)",
        brand: {
          blue: "var(--brand-blue)",
          yellow: "var(--brand-yellow)",
          red: "var(--brand-red)",
          green: "var(--brand-green)",
          "blue-50": "var(--brand-blue-50)",
          "yellow-50": "var(--brand-yellow-50)",
          "red-50": "var(--brand-red-50)",
          "green-50": "var(--brand-green-50)",
        },
        // shadcn aliases (mapped to our tokens)
        background: "var(--bg)",
        foreground: "var(--ink)",
        muted: { DEFAULT: "var(--surface-muted)", foreground: "var(--ink-3)" },
        primary: { DEFAULT: "var(--brand-blue)", foreground: "#ffffff" },
        secondary: { DEFAULT: "var(--surface-muted)", foreground: "var(--ink)" },
        destructive: { DEFAULT: "var(--brand-red)", foreground: "#ffffff" },
        accent: { DEFAULT: "var(--brand-blue-50)", foreground: "var(--ink)" },
        popover: { DEFAULT: "var(--surface)", foreground: "var(--ink)" },
        card: { DEFAULT: "var(--surface)", foreground: "var(--ink)" },
        border: "var(--line)",
        input: "var(--line)",
        ring: "var(--focus)",
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ['"Geist"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"Geist Mono"', "ui-monospace", "monospace"],
      },
      fontSize: {
        "display-2xl": ["clamp(2.5rem, 6vw + 1rem, 4.5rem)", { lineHeight: "1.02", letterSpacing: "-0.03em", fontWeight: "600" }],
        "display-xl": ["clamp(2rem, 4.5vw + 1rem, 3.5rem)", { lineHeight: "1.05", letterSpacing: "-0.025em", fontWeight: "600" }],
        "display-lg": ["clamp(1.75rem, 3vw + 1rem, 2.5rem)", { lineHeight: "1.10", letterSpacing: "-0.02em", fontWeight: "600" }],
        h1: ["2rem", { lineHeight: "1.15", letterSpacing: "-0.015em", fontWeight: "600" }],
        h2: ["1.5rem", { lineHeight: "1.25", letterSpacing: "-0.01em", fontWeight: "600" }],
        h3: ["1.25rem", { lineHeight: "1.30", letterSpacing: "-0.005em", fontWeight: "600" }],
        h4: ["1.0625rem", { lineHeight: "1.40", fontWeight: "600" }],
        "body-lg": ["1.125rem", { lineHeight: "1.60" }],
        body: ["1rem", { lineHeight: "1.60" }],
        "body-sm": ["0.9375rem", { lineHeight: "1.55" }],
        caption: ["0.8125rem", { lineHeight: "1.50", letterSpacing: "0.005em", fontWeight: "500" }],
        mono: ["0.875rem", { lineHeight: "1.50" }],
        eyebrow: ["0.75rem", { lineHeight: "1.40", letterSpacing: "0.12em", fontWeight: "600" }],
      },
      borderRadius: {
        sm: "8px",
        DEFAULT: "12px",
        md: "12px",
        lg: "20px",
        xl: "28px",
      },
      boxShadow: {
        "1": "0 1px 2px rgba(14,17,22,0.04), 0 1px 1px rgba(14,17,22,0.03)",
        "2": "0 6px 24px -8px rgba(14,17,22,0.10), 0 2px 6px -2px rgba(14,17,22,0.05)",
        "3": "0 24px 60px -20px rgba(14,17,22,0.18), 0 4px 12px -4px rgba(14,17,22,0.06)",
      },
      transitionTimingFunction: {
        "out-soft": "cubic-bezier(0.22, 1, 0.36, 1)",
        "in-out-soft": "cubic-bezier(0.65, 0, 0.35, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      transitionDuration: {
        "120": "120ms",
        "200": "200ms",
        "320": "320ms",
        "520": "520ms",
        "800": "800ms",
      },
      maxWidth: {
        prose: "640px",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
      },
      animation: {
        "accordion-down": "accordion-down 200ms ease-out",
        "accordion-up": "accordion-up 200ms ease-out",
      },
    },
  },
  plugins: [animate],
};

export default config;
