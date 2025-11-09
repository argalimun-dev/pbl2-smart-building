"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useParams } from "next/navigation";
import { X, RotateCcw } from "lucide-react";

export default function MemoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const memoryId = params?.id;

  const [memory, setMemory] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commenter, setCommenter] = useState("");
  const [secretCode, setSecretCode] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔹 Zoom & Fullscreen states
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [lastTouchDist, setLastTouchDist] = useState<number | null>(null);
  const [showUI, setShowUI] = useState(true);
  const hideTimer = useRef<NodeJS.Timeout | null>(null);

  // 🕒 Auto-hide UI (seperti Google Photos)
  const resetHideTimer = () => {
    setShowUI(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowUI(false), 2500);
  };

  // 🎯 Ambil data memory & komentar
  useEffect(() => {
    const fetchData = async () => {
      const { data: memData } = await supabase
        .from("memories")
        .select("*")
        .eq("id", memoryId)
        .single();

      setMemory(memData);

      const { data: comData } = await supabase
        .from("comments")
        .select("*")
        .eq("memory_id", memoryId)
        .order("created_at", { ascending: false });

      setComments(comData || []);
      setLoading(false);
    };

    if (memoryId) fetchData();
  }, [memoryId]);

  // 💬 Kirim komentar
  const handleComment = async (e: any) => {
    e.preventDefault();
    if (!newComment.trim() || !commenter.trim()) return;

    const { data, error } = await supabase
      .from("comments")
      .insert([
        {
          memory_id: memoryId,
          text: newComment.trim(),
          commenter: commenter.trim(),
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) return alert("Gagal menambahkan komentar 😔");

    setComments([data[0], ...comments]);
    setNewComment("");
    setCommenter("");
  };

  // 🗑️ Hapus memory (kode tetap sama seperti punyamu)
  const handleDelete = async () => {
    if (!secretCode.trim()) return alert("Masukkan kode rahasia dulu!");
    if (!memory) return;

    const confirmDelete = confirm("⚠️ Yakin ingin menghapus kenangan ini?");
    if (!confirmDelete) return;

    try {
      setDeleting(true);
      const { data: validCode, error: codeErr } = await supabase
        .from("access_codes")
        .select("*")
        .ilike("code", secretCode.trim())
        .single();

      if (codeErr || !validCode) {
        alert("🚫 Kode rahasia salah!");
        setDeleting(false);
        return;
      }

      await supabase.from("comments").delete().eq("memory_id", memory.id);

      const imagePath = memory.image_url?.split("/storage/v1/object/public/images/")[1];
      if (imagePath) await supabase.storage.from("images").remove([imagePath]);

      await supabase.from("memories").delete().eq("id", memory.id);

      alert("✅ Kenangan berhasil dihapus!");
      router.push("/memory");
      router.refresh();
    } catch (err) {
      alert("Terjadi kesalahan saat menghapus!");
    } finally {
      setDeleting(false);
    }
  };

  // 🧭 Zoom & Gesture handlers
  const handleWheel = (e: any) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((z) => Math.min(Math.max(z + delta, 1), 5));
    resetHideTimer();
  };

  const handleMouseDown = (e: any) => {
    setIsDragging(true);
    setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
    resetHideTimer();
  };
  const handleMouseMove = (e: any) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - startPos.x, y: e.clientY - startPos.y });
  };
  const handleMouseUp = () => setIsDragging(false);

  const getTouchDistance = (touches: TouchList) => {
    const [a, b] = touches;
    return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
  };

  const handleTouchStart = (e: TouchEvent | any) => {
    if (e.touches.length === 2) {
      setLastTouchDist(getTouchDistance(e.touches));
    } else if (e.touches.length === 1) {
      setIsDragging(true);
      setStartPos({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
    resetHideTimer();
  };

  const handleTouchMove = (e: TouchEvent | any) => {
    if (e.touches.length === 2 && lastTouchDist) {
      const newDist = getTouchDistance(e.touches);
      const diff = newDist - lastTouchDist;
      setZoom((z) => Math.min(Math.max(z + diff / 300, 1), 5));
      setLastTouchDist(newDist);
    } else if (e.touches.length === 1 && isDragging) {
      setPosition({
        x: e.touches[0].clientX - startPos.x,
        y: e.touches[0].clientY - startPos.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setLastTouchDist(null);
  };

  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    resetHideTimer();
  };

  if (loading) return <p className="text-white p-6">Loading...</p>;
  if (!memory) return <p className="text-white p-6">Memory tidak ditemukan.</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 text-white relative">
      {/* Tombol hapus */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-30">
        <input
          type="password"
          placeholder="Kode rahasia"
          className="w-40 p-1 text-sm rounded bg-gray-900 border border-gray-700 text-white"
          value={secretCode}
          onChange={(e) => setSecretCode(e.target.value)}
        />
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="bg-red-700 hover:bg-red-800 text-xs px-3 py-1 rounded text-white"
        >
          {deleting ? "..." : "Hapus"}
        </button>
      </div>

      <button
        onClick={() => router.push("/memory")}
        className="text-blue-400 hover:underline mb-4 block"
      >
        ← Kembali ke Memory Wall
      </button>

      {/* 🖼️ Klik gambar untuk fullscreen */}
      <img
        src={memory.image_url}
        alt={memory.title}
        className="w-full rounded-lg mb-4 cursor-zoom-in"
        onClick={() => setIsFullscreen(true)}
      />

      <h1 className="text-2xl font-bold mb-2">{memory.title}</h1>
      <p className="text-gray-300 mb-2">{memory.description}</p>
      <p className="text-sm text-gray-500 mb-6">
        📅 {new Date(memory.created_at).toLocaleDateString()} — 👤{" "}
        {memory.uploader}
      </p>

      <hr className="border-gray-700 mb-6" />

      {/* 💬 Komentar */}
      <h2 className="text-xl font-semibold mb-3">Komentar</h2>
      <div className="space-y-3 mb-6">
        {comments.length ? (
          comments.map((c, i) => (
            <div key={i} className="bg-gray-800 border border-gray-700 rounded p-3">
              <p className="text-sm text-gray-200 whitespace-pre-wrap">{c.text}</p>
              <p className="text-xs text-gray-500 mt-2 flex justify-end">
                📅 {new Date(c.created_at).toLocaleDateString()} — 👤{" "}
                {c.commenter || "Anonim"}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">Belum ada komentar.</p>
        )}
      </div>

      <hr className="border-gray-700 my-6" />

      <form onSubmit={handleComment} className="mb-4 space-y-2">
        <textarea
          placeholder="Tulis komentar..."
          className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-white text-sm"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Namamu"
            className="flex-1 p-2 rounded bg-gray-900 border border-gray-700 text-white text-sm"
            value={commenter}
            onChange={(e) => setCommenter(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-sm rounded"
          >
            Kirim
          </button>
        </div>
      </form>

      {/* 🔍 Fullscreen Viewer ala Google Photos */}
      {isFullscreen && (
        <div
          className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => setIsDragging(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseMoveCapture={resetHideTimer}
          onTouchStartCapture={resetHideTimer}
        >
          {/* 🔹 Tombol overlay muncul otomatis */}
          {showUI && (
            <div className="absolute top-4 right-4 flex gap-3 z-[60] transition-opacity duration-300">
              <button
                onClick={handleReset}
                className="bg-slate-800/70 hover:bg-slate-700 p-2 rounded-full text-white shadow-lg backdrop-blur-sm"
              >
                <RotateCcw size={18} />
              </button>
              <button
                onClick={() => setIsFullscreen(false)}
                className="bg-slate-800/70 hover:bg-slate-700 p-2 rounded-full text-white shadow-lg backdrop-blur-sm"
              >
                <X size={20} />
              </button>
            </div>
          )}

          {/* 🔹 Gambar zoomable */}
          <img
            src={memory.image_url}
            alt={memory.title}
            draggable={false}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              transition: isDragging ? "none" : "transform 0.1s ease-out",
            }}
            className="max-w-none object-contain select-none pointer-events-none"
          />
        </div>
      )}
    </div>
  );
}
