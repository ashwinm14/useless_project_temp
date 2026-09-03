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
    <html lang="en" className="dark">
      <body className={`${outfit.className} bg-neutral-950 text-neutral-50 overflow-x-hidden min-h-screen relative`}>
        {/* Animated Background Elements */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-orange-600/20 blur-[120px] mix-blend-screen animate-pulse-slow" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-600/20 blur-[150px] mix-blend-screen animate-pulse-slower" />
        </div>
        {children}
      </body>
    </html>
  );
}