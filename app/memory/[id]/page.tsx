"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import CommentSection from "@/components/CommentSection";

interface Memory {
  id: number;
  title: string;
  description: string;
  image_url: string;
  uploader: string;
  created_at: string;
}

export default function MemoryDetailPage() {
  const { id } = useParams();
  const [memory, setMemory] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔍 Zoom & drag states
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [fullscreen, setFullscreen] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (id) fetchMemory();
  }, [id]);

  const fetchMemory = async () => {
    const { data, error } = await supabase
      .from("memories")
      .select("*")
      .eq("id", id)
      .single();

    if (error) console.error("Gagal memuat kenangan:", error);
    else setMemory(data);
    setLoading(false);
  };

  // 📦 Pointer events (drag aktif selama ditekan)
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
    setLastPos({ x: e.clientX, y: e.clientY });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    e.preventDefault();
    const dx = e.clientX - lastPos.x;
    const dy = e.clientY - lastPos.y;
    setLastPos({ x: e.clientX, y: e.clientY });
    setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    setDragging(false);
  };

  // 🖱️ Zoom via scroll wheel / pinch
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 0.1;
    const newScale = Math.min(Math.max(scale - e.deltaY * zoomFactor * 0.01, 1), 5);
    setScale(newScale);
  };

  // 🔍 Klik gambar → fullscreen zoom-in
  const toggleFullscreen = () => {
    if (!fullscreen) {
      setFullscreen(true);
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  // 🚪 Klik area gelap untuk keluar fullscreen
  const exitFullscreen = () => {
    if (fullscreen) {
      setFullscreen(false);
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-400">
        Memuat kenangan...
      </div>
    );
  }

  if (!memory) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-red-400">
        Kenangan tidak ditemukan 😢
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 relative">
      <div className="max-w-4xl mx-auto px-5 py-10">
        {/* Tombol Kembali */}
        <div className="mb-6 flex items-center">
          <Link
            href="/memory"
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span className="text-xl">←</span>
            <span>Kembali ke Memory Wall</span>
          </Link>
        </div>

        {/* Gambar Utama */}
        <div
          className="rounded-2xl overflow-hidden shadow-2xl border border-gray-800 bg-gray-900 flex justify-center items-center mb-6 cursor-zoom-in"
          onClick={toggleFullscreen}
        >
          <img
            src={memory.image_url}
            alt={memory.title}
            className="max-h-[700px] w-auto object-contain transition-transform duration-300 hover:scale-110"
          />
        </div>

        {/* Info Kenangan */}
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-lg backdrop-blur-sm">
          <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
            {memory.title}
          </h1>
          <p className="text-gray-300 leading-relaxed mb-6">
            {memory.description || "Tanpa deskripsi"}
          </p>

          <div className="text-sm text-gray-400 border-t border-gray-800 pt-4 space-y-1">
            <p>
              📸 Diunggah oleh{" "}
              <span className="font-medium text-blue-300">
                {memory.uploader}
              </span>
            </p>
            <p>
              🗓️{" "}
              {new Date(memory.created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Komentar */}
        <div className="mt-10">
          <CommentSection memoryId={memory.id.toString()} />
        </div>
      </div>

      {/* 🌌 Fullscreen Mode */}
      {fullscreen && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center cursor-zoom-out"
          onClick={exitFullscreen}
        >
          <div
            className="relative w-full h-full flex items-center justify-center overflow-hidden touch-none select-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onWheel={handleWheel}
          >
            <img
              ref={imgRef}
              src={memory.image_url}
              alt={memory.title}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transition: dragging ? "none" : "transform 0.2s ease",
                cursor: dragging ? "grabbing" : "grab",
              }}
              className="max-h-[95vh] max-w-[95vw] object-contain"
              draggable={false}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
