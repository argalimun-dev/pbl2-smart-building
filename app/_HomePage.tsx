"use client";
import Link from "next/link";

export default function HomePage() {
  return (
    <main
      className="
        min-h-screen w-full 
        flex flex-col justify-center items-center
        text-center px-6
        bg-gradient-to-b from-gray-900 via-gray-950 to-black 
        text-gray-100 bg-fixed
      "
    >
      {/* Judul utama */}
      <h1
        className="
          text-5xl md:text-7xl font-extrabold 
          mb-8 pb-3 max-w-screen-sm select-none
          bg-gradient-to-r from-blue-400 to-purple-400 
          text-transparent bg-clip-text 
          tracking-tight leading-[1.15] drop-shadow-2xl
        "
      >
        Selamat Datang di Smart Project Wall
      </h1>

      {/* Deskripsi */}
      <p className="text-gray-400 text-lg max-w-2xl mb-10 leading-relaxed">
        Platform dokumentasi untuk warga{" "}
        <span className="text-blue-400 font-semibold">
          CV. Bangunan Cerdas Indonesia
        </span>
        . <br />
        Simpan dan bagikan Project berharga dalam perjalanan kalian ✨
      </p>

      {/* Tombol */}
      <Link
        href="/memory"
        className="
          bg-blue-600 hover:bg-blue-700 
          text-white text-lg font-medium
          px-8 py-3 rounded-xl 
          shadow-lg transition transform hover:scale-105
        "
      >
        🚀 Masuk ke Smart Project Wall
      </Link>
    </main>
  );
}
