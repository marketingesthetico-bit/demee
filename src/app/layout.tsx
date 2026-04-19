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

const GOOGLE_FONTS_HREF =
  "https://fonts.googleapis.com/css2?" +
  [
    "family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400",
    "family=Inter:wght@400;500;600;700",
    "family=Source+Serif+4:ital,wght@0,400;0,600;1,400",
    "family=Archivo:wght@400;500;600;700",
    "family=Archivo+Black",
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
