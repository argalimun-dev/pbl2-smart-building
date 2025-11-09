"use client";
import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100 py-16 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Judul */}
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">
          Tentang Proyek
        </h1>

        {/* Deskripsi */}
        <p className="text-lg text-gray-300 leading-relaxed">
          <strong>PBL 2 Smart Building</strong> adalah proyek berbasis <em>Project Based Learning</em> yang berfokus pada penerapan sistem integrasi bangunan cerdas. Aplikasi ini dirancang untuk 
          menampilkan, menyimpan, dan berbagi berbagai <em>kenangan</em> atau dokumentasi kegiatan 
          terkait proyek Smart Building, dalam bentuk galeri digital yang interaktif.
        </p>

        <p className="text-lg text-gray-300 leading-relaxed">
          Setiap kenangan dapat dilihat secara detail, diberi komentar, dan menjadi bagian dari 
          dokumentasi perkembangan proyek kami. Sistem ini dibangun menggunakan teknologi modern 
          seperti <strong>Next.js</strong>, <strong>Tailwind CSS</strong>, dan <strong>Vercel</strong> untuk memastikan performa optimal di berbagai perangkat.
        </p>

        {/* Tim */}
        <section className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Tim Pengembang</h2>
          <ul className="space-y-2 text-gray-300">
            <li>👨‍💻 <strong>Arga Bharata</strong> — Pengembang Utama & Integrator</li>
            <li>🏗️ <strong>Tim PBL Smart Building Batch 2</strong> — Desain & Dokumentasi</li>
            <li>💡 <strong>Dosen Pembimbing</strong> — Ibnu Haroen Al Mudzakkir</li>
          </ul>
        </section>

        {/* Navigasi */}
        <div className="text-center mt-10">
          <Link
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl shadow-md transition-all duration-200"
          >
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </main>
  );
}
