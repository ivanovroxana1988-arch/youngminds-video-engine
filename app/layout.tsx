import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YoungMinds Video Engine",
  description: "Transformă un script în postări Instagram și programează-le prin Postiz."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body>{children}</body>
    </html>
  );
}
