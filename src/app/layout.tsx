import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sarah & Jonas – Unsere Hochzeit",
  description:
    "Teile deine schönsten Fotos von unserer Hochzeit mit uns – lade sie ganz einfach hier hoch.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
