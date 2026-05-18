import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DegreePath — your academic compass",
  description:
    "DegreePath generates a clear semester-by-semester roadmap to graduation, tailored to your university, major, and completed coursework.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
