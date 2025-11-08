"use client";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 via-gray-950 to-black text-gray-100 px-6 text-center">
      {/* Judul utama */}
      <h1 className="text-5xl md:text-7xl font-extrabold mb-8 bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text drop-shadow-2xl tracking-tight leading-[1.15] pb-3">
  Selamat Datang di Smart Memory Wall
</h1>

      {/* Deskripsi singkat */}
      <p className="text-gray-400 text-lg max-w-2xl mb-10 leading-relaxed">
        Platform dokumentasi untuk warga{" "}
        <span className="text-blue-400">PBL 2 Smart Building</span>.
        <br />
        Simpan dan bagikan momen berharga dalam perjalanan kalian ✨
      </p>

      {/* Tombol ke Memory Wall */}
      <Link
        href="/memory"
        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-lg font-medium transition transform hover:scale-105 shadow-lg"
      >
        🚀 Masuk ke Memory Wall
      </Link>
    </main>
  );
}