"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

interface Memory {
  id: number;
  title: string;
  description: string;
  image_url: string;
  created_at: string;
  uploader?: string;
}

export default function MemoryPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemories();
  }, []);

  const fetchMemories = async () => {
    const { data, error } = await supabase
      .from("memories")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching memories:", error);
    } else {
      setMemories(data || []);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-gray-300">
        Memuat Project...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-gray-100 flex flex-col items-center">
      {/* Header */}
      <div className="w-full text-center pt-2 pb-10 bg-gray-900/40 backdrop-blur-sm -mt-2">
        <h1 className="text-7xl font-extrabold text-white mb-5 drop-shadow-lg tracking-tight">
          Smart Project Wall
        </h1>
        <p className="text-gray-400 text-xl">Kumpulan Project berharga Kalian 📸</p>
      </div>

      {/* Grid Foto */}
      {memories.length === 0 ? (
        <p className="text-gray-500 text-center mt-20">
          Belum ada Project yang ditambahkan 😢
        </p>
      ) : (
        <div className="w-full px-10 py-10">
          <div
            className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 max-w-[1600px] mx-auto"
          >
            {memories.map((memory) => (
              <Link key={memory.id} href={`/memory/${memory.id}`}>
                <div className="relative group cursor-pointer overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 bg-gray-800/80 border border-gray-700 hover:border-blue-400">
                  <img
                    src={memory.image_url}
                    alt={memory.title}
                    className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                    <p className="font-bold text-lg">{memory.title}</p>
                    <p className="text-xs text-gray-300 italic">
                      oleh {memory.uploader || "Anonim"}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
