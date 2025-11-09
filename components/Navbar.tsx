"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

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

        {/* Tombol Menu untuk Mobile */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-slate-100 hover:text-blue-400 transition"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Menu kanan (desktop) */}
        <div className="hidden md:flex items-center space-x-4">
          <Link
            href="/memory/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-xl shadow-md hover:bg-blue-500 hover:shadow-lg transition-all duration-200"
          >
            + Tambah Memory
          </Link>
          <Link
            href="/about"
            className="text-slate-100 border border-slate-600 px-4 py-2 rounded-xl hover:bg-slate-700 hover:text-blue-300 transition-all duration-200"
          >
            Tentang
          </Link>
        </div>
      </div>

      {/* Dropdown menu untuk mobile */}
      {menuOpen && (
        <div className="md:hidden bg-slate-800 border-t border-slate-700">
          <div className="px-6 py-4 flex flex-col space-y-3">
            <Link
              href="/memory/new"
              onClick={() => setMenuOpen(false)}
              className="text-white bg-blue-600 px-4 py-2 rounded-xl text-center hover:bg-blue-500 transition-all"
            >
              + Tambah Memory
            </Link>
            <Link
              href="/about"
              onClick={() => setMenuOpen(false)}
              className="text-white border border-slate-600 px-4 py-2 rounded-xl text-center hover:bg-slate-700 hover:text-blue-300 transition-all"
            >
              Tentang
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
