/** @type {import('tailwindcss').Config} */
const defaultConfig = require("shadcn/ui/tailwind.config")

module.exports = {
  ...defaultConfig,
  content: [...defaultConfig.content, "./pages/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}", "*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    ...defaultConfig.theme,
    extend: {
      ...defaultConfig.theme.extend,
      fontFamily: {
        mono: ["var(--font-geist-mono)", "Courier New", "monospace"],
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
      animation: {
        "matrix-rain": "matrix-rain 20s linear infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite alternate",
        "scan-line": "scan-line 2s linear infinite",
      },
      keyframes: {
        "matrix-rain": {
          "0%": { transform: "translateY(-100vh)" },
          "100%": { transform: "translateY(100vh)" },
        },
        "pulse-glow": {
          "0%": { boxShadow: "0 0 5px currentColor" },
          "100%": { boxShadow: "0 0 20px currentColor, 0 0 30px currentColor" },
        },
        "scan-line": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100vw)" },
        },
      },
    },
  },
  plugins: [...defaultConfig.plugins, require("tailwindcss-animate")],
}
