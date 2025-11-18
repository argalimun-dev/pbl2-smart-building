"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function NewMemoryPage() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploader, setUploader] = useState("");
  const [secretCode, setSecretCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) return alert("📸 Pilih gambar dulu!");
    if (!title.trim()) return alert("✏️ Isi judul dulu!");
    if (!uploader.trim()) return alert("👤 Isi nama pengunggah dulu!");
    if (!secretCode.trim()) return alert("🔐 Masukkan kode rahasia dulu!");

    setLoading(true);

    // 🔐 Cek validasi kode rahasia di Supabase
    const { data: validCode, error: codeError } = await supabase
      .from("access_codes")
      .select("*")
      .eq("code", secretCode.trim())
      .single();

    if (codeError || !validCode) {
      alert("🚫 Kode rahasia salah! Hanya tim tertentu yang bisa upload.");
      setLoading(false);
      return;
    }

    const fileName = `${Date.now()}-${file.name}`;

    // Upload ke Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(fileName, file);

    if (uploadError) {
      alert("❌ Gagal upload gambar!");
      console.error(uploadError);
      setLoading(false);
      return;
    }

    // Ambil URL publik
    const { data } = supabase.storage.from("images").getPublicUrl(fileName);
    const imageUrl = data?.publicUrl;

    // Simpan ke tabel memories
    const { error: insertError } = await supabase.from("memories").insert([
      {
        title,
        description,
        image_url: imageUrl,
        uploader,
      },
    ]);

    if (insertError) {
      alert("❌ Gagal menyimpan ke database!");
      console.error(insertError);
    } else {
      alert("✅ Berhasil menambahkan Project 🎉");
      router.push("/memory");
      router.refresh();
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-gray-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl bg-gray-800/70 backdrop-blur-md rounded-2xl shadow-lg p-8 border border-gray-700">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-400 drop-shadow-md">
          Tambah Project Baru 🌤️
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Judul */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Judul Project
            </label>
            <input
              type="text"
              placeholder="Contoh: Kesetrum"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-700 bg-gray-900 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Deskripsi
            </label>
            <textarea
              placeholder="Tuliskan cerita singkat tentang Project ini..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-700 bg-gray-900 focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none"
              rows={3}
            />
          </div>

          {/* File Gambar */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Unggah Gambar
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 
                         file:rounded-full file:border-0 
                         file:text-sm file:font-semibold 
                         file:bg-blue-100 file:text-blue-700 
                         hover:file:bg-blue-200 cursor-pointer"
            />
          </div>

          {/* Nama Pengunggah */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Nama Pengunggah
            </label>
            <input
              type="text"
              placeholder="Anda ingin disebut apa"
              value={uploader}
              onChange={(e) => setUploader(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-700 bg-gray-900 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          {/* Kode Rahasia */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Kode Rahasia (khusus tim)
            </label>
            <input
              type="password"
              placeholder="Masukkan kode rahasia..."
              value={secretCode}
              onChange={(e) => setSecretCode(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-700 bg-gray-900 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          {/* Tombol Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 shadow-md disabled:opacity-70"
          >
            {loading ? "Mengunggah..." : "💾 Simpan Project"}
          </button>
        </form>

        <div className="flex justify-center items-center mt-6 text-sm">
          <button
            onClick={() => router.push("/memory")}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            ← Kembali ke Smart Project Wall
          </button>
        </div>
      </div>
    </div>
  );
}
