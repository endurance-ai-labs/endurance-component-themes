import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Endurance components",
  description: "Foundations gallery. Restricted to Endurance accounts.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
