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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) return alert("Pilih gambar dulu!");
    if (!title.trim()) return alert("Isi judul dulu!");
    if (!uploader.trim()) return alert("Isi nama pengunggah dulu!");

    setLoading(true);
    const fileName = `${Date.now()}-${file.name}`;

    // Upload ke Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(fileName, file);

    if (uploadError) {
      alert("Gagal upload gambar!");
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
      alert("Gagal menyimpan ke database!");
      console.error(insertError);
    } else {
      alert("Berhasil menambahkan kenangan 🎉");
      router.push("/");
      router.refresh();
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 via-gray-200 to-gray-300 text-gray-900 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-8">
        {/* Judul */}
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Tambah Kenangan Baru 🌤️
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Judul */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Judul Kenangan
            </label>
            <input
              type="text"
              placeholder="Contoh: Kesetrum"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi
            </label>
            <textarea
              placeholder="Tuliskan cerita singkat tentang kenangan ini..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none"
              rows={3}
            />
          </div>

          {/* File Gambar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unggah Gambar
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 
                         file:rounded-full file:border-0 
                         file:text-sm file:font-semibold 
                         file:bg-blue-100 file:text-blue-700 
                         hover:file:bg-blue-200 cursor-pointer"
            />
          </div>

          {/* Nama Pengunggah */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Pengunggah
            </label>
            <input
              type="text"
              placeholder="Masukkan nama Anda"
              value={uploader}
              onChange={(e) => setUploader(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          {/* Tombol Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 shadow-md disabled:opacity-70"
          >
            {loading ? "Mengunggah..." : "💾 Simpan Kenangan"}
          </button>
        </form>

        {/* Tombol Kembali */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push("/memory")}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            ← Kembali ke Memory Wall
          </button>
        </div>
      </div>
    </div>
  );
}
