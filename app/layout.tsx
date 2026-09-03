import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"] });

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
      <body className={`${outfit.className} bg-[var(--background)] text-[var(--foreground)] overflow-x-hidden min-h-screen relative transition-colors duration-500`}>
        {children}
      </body>
    </html>
  );
}