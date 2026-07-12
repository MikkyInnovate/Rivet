import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nodal — Interactive Circuit Simulator",
  description:
    "Build, simulate, and share electronic circuits in your browser. Drag-and-drop components onto a 3D canvas with real-time physics simulation.",
  keywords: [
    "circuit simulator",
    "electronics",
    "3D",
    "breadboard",
    "LED",
    "Nodal",
  ],
};

import Sidebar from "@/components/layout/Sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen w-screen flex bg-slate-950 overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
