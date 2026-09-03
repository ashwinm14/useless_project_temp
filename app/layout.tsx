import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BiteCount 🍪",
  description: "How many bites are left?",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}