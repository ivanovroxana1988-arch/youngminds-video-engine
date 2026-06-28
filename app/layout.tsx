import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YoungMinds Content Studio",
  description: "Generator dedicat pentru postari Instagram YoungMinds: afterschool, STEM, robotica, pian, limbi straine si activitati pentru copii."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body>{children}</body>
    </html>
  );
}
