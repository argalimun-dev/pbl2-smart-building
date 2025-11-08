"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 shadow-md">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Kiri - Judul */}
        <div>
          <Link
            href="/"
            className="font-semibold text-lg text-slate-100 hover:text-blue-400 transition"
          >
            PBL 2 Smart Building
          </Link>
          <div className="text-sm text-gray-400">
  Pemasangan Sistem Integrasi Bangunan Cerdas
</div>
        </div>

        {/* Kanan - Tombol Tambah */}
        <Link
          href="/memory/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-xl shadow-md hover:bg-blue-500 hover:shadow-lg transition-all duration-200"
        >
          + Tambah Memory
        </Link>
      </div>
    </nav>
  );
}
