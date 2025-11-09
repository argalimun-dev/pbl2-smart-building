"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Comment {
  id: string;
  text: string;
  created_at: string;
  memory_id: string;
  commenter?: string;
}

interface CommentSectionProps {
  memoryId: string;
}

export default function CommentSection({ memoryId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commenter, setCommenter] = useState("");
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Ambil komentar saat memoryId berubah
  useEffect(() => {
    fetchComments();
  }, [memoryId]);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("memory_id", memoryId)
      .order("created_at", { ascending: true });

    if (error) console.error("Gagal mengambil komentar:", error);
    else setComments(data || []);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setLoading(true);
    const { error } = await supabase.from("comments").insert([
      {
        text: newComment.trim(),
        memory_id: memoryId,
        commenter: commenter.trim() || "Anonim",
      },
    ]);

    if (error) console.error("Gagal menambahkan komentar:", error);
    else {
      setNewComment("");
      fetchComments();
    }
    setLoading(false);
  };

  // Fitur kirim komentar pakai Enter, Shift+Enter untuk baris baru
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  // Auto-expand textarea saat mengetik
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [newComment]);

  return (
    <div className="mt-10 bg-gray-800 p-6 rounded-xl shadow-inner border border-gray-700">
      <h2 className="text-lg font-semibold text-white mb-4">Komentar</h2>

      {/* Daftar komentar */}
      {comments.length === 0 ? (
        <p className="text-gray-500 italic">Belum ada komentar 😅</p>
      ) : (
        <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto pr-2">
          {comments.map((c) => (
            <div
              key={c.id}
              className="bg-gray-900 border border-gray-700 p-3 rounded-md shadow-sm"
            >
              <p className="text-gray-200 whitespace-pre-line">{c.text}</p>
              <p className="text-xs text-gray-400 mt-1">
                oleh <span className="font-medium">{c.commenter || "Anonim"}</span> ·{" "}
                {new Date(c.created_at).toLocaleString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Form komentar */}
      <div className="space-y-3">
        {/* Kolom komentar (textarea) */}
        <textarea
          ref={textareaRef}
          placeholder="Tulis komentar kamu di sini... (Enter untuk kirim, Shift+Enter untuk baris baru)"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          className="w-full border border-gray-700 bg-gray-900 text-gray-100 rounded-md p-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all duration-150"
        />

        {/* Kolom nama */}
        <input
          type="text"
          placeholder="Nama kamu..."
          value={commenter}
          onChange={(e) => setCommenter(e.target.value)}
          className="w-full border border-gray-700 bg-gray-900 text-gray-100 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
        />

        {/* Tombol kirim */}
        <button
          onClick={handleAddComment}
          disabled={loading}
          className="bg-blue-500 w-full text-white px-4 py-2 rounded-md hover:bg-blue-600 transition disabled:opacity-50"
        >
          {loading ? "Mengirim..." : "Kirim"}
        </button>
      </div>
    </div>
  );
}
