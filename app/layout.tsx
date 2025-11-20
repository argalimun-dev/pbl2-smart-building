import "./globals.css";
import Navbar from "@/components/Navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CV. Bangunan Cerdas Indonesia",
  description: "Smart Project Wall untuk menyimpan Project berharga Kami",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="bg-gradient-to-b from-gray-900 via-gray-950 to-black text-gray-100 min-h-screen">
        {/* ⭐ Navbar fixed dengan z-index tinggi */}
        <Navbar />

        {/* ⭐ Beri padding top agar konten tidak tertutup Navbar */}
        <main className="pt-20">{children}</main>
      </body>
    </html>
  );
}
