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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
