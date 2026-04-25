import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Demee · Tu mini-web de freelance lista en 5 minutos",
    template: "%s · Demee",
  },
  description:
    "Portfolio, presupuestos y agenda en una sola URL personal. Freemium generoso, sin fricción.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
};

// Each public-facing aesthetic gets its own typographic voice. Keeping
// the families in one stylesheet request (one HTTP round-trip) avoids
// blowing up TTFB now that we ship 6 themes:
//
//   minimal    → Inter
//   editorial  → Fraunces + Source Serif 4
//   bold       → Archivo Black + Archivo
//   playful    → Outfit
//   corporate  → Manrope + Inter
//   artistic   → Caprasimo + Source Serif 4
const GOOGLE_FONTS_HREF =
  "https://fonts.googleapis.com/css2?" +
  [
    "family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400",
    "family=Inter:wght@400;500;600;700",
    "family=Source+Serif+4:ital,wght@0,400;0,600;1,400",
    "family=Archivo:wght@400;500;600;700",
    "family=Archivo+Black",
    "family=Outfit:wght@400;500;600;700;800",
    "family=Manrope:wght@400;500;600;700;800",
    "family=Caprasimo",
  ].join("&") +
  "&display=swap";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={GOOGLE_FONTS_HREF} />
      </head>
      <body>{children}</body>
    </html>
  );
}
