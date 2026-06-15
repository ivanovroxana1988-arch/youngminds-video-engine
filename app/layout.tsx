import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YoungMinds Video Engine",
  description: "Generate TikTok-ready MP4 batches from CSV or Excel rows.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ro">
      <body>{children}</body>
    </html>
  );
}
