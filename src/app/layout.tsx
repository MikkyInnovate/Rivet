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
  title: "Graphite — Engineering Sandbox",
  description:
    "Build and simulate circuits on a 3D breadboard, and turn 2D engineering drawings into interactive 3D models with AI.",
  keywords: [
    "circuit simulator",
    "electronics",
    "3D",
    "breadboard",
    "CAD",
    "engineering drawings",
    "Graphite",
  ],
};

import Sidebar from "@/components/layout/Sidebar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster } from "@/components/ui/toast";

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
      <body className="min-h-screen w-screen flex bg-white overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
        <Toaster />
      </body>
    </html>
  );
}
