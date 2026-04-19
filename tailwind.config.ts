import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        paper: "#F7F4EC",
        ink: "#2A2A28",
        olive: {
          DEFAULT: "#5B6B3C",
          50: "#F3F5EC",
          100: "#E6EBD6",
          200: "#CED8AE",
          300: "#B3C185",
          400: "#8FA15D",
          500: "#5B6B3C",
          600: "#4A5831",
          700: "#3A4527",
          800: "#2D361E",
          900: "#1F2514",
        },
        mustard: {
          DEFAULT: "#D4A02F",
          50: "#FBF4E0",
          100: "#F7E8BD",
          200: "#EFD37A",
          300: "#E5BC49",
          400: "#D4A02F",
          500: "#B3841F",
          600: "#8F6918",
        },
        success: "#3D8B56",
        danger: "#C8553D",
        "aesthetic-bg": "var(--aesthetic-color-bg)",
        "aesthetic-fg": "var(--aesthetic-color-fg)",
        "aesthetic-muted": "var(--aesthetic-color-muted)",
        "aesthetic-accent": "var(--aesthetic-color-accent)",
        "aesthetic-accent-contrast": "var(--aesthetic-color-accent-contrast)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        "aesthetic-display": ["var(--aesthetic-font-display)"],
        "aesthetic-body": ["var(--aesthetic-font-body)"],
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
        sm: "4px",
        "aesthetic-base": "var(--aesthetic-radius-base)",
      },
    },
  },
  plugins: [],
};

export default config;
