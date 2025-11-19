"use client";

import { useEffect, useState, useRef, forwardRef, useImperativeHandle } from "react";
import { supabase } from "@/lib/supabaseClient";
import { X } from "lucide-react";

interface Comment {
  id: string;
  text: string;
  created_at: string;
  memory_id: string;
  commenter?: string | null;
}

export interface CommentSectionRef {
  openModal: () => void;
}

interface Props {
  memoryId: string;
  onNewComment?: (c: Comment) => void;
}

const CommentSection = forwardRef<CommentSectionRef, Props>(
  ({ memoryId, onNewComment }, ref) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loadingComments, setLoadingComments] = useState(true);

    // modal states
    const [showModal, setShowModal] = useState(false);
    const [name, setName] = useState("");
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    // expose function to parent
    useImperativeHandle(ref, () => ({
      openModal: () => setShowModal(true),
    }));

    // fetch comments
    useEffect(() => {
      if (!memoryId) return;
      fetchComments();
    }, [memoryId]);

    const fetchComments = async () => {
      setLoadingComments(true);
      try {
        const { data, error } = await supabase
          .from("comments")
          .select("*")
          .eq("memory_id", memoryId)
          .order("created_at", { ascending: true });

        if (!error) setComments(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingComments(false);
      }
    };

    // autosize textarea
    useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, [text]);

    const handleSend = async () => {
      if (!text.trim()) return alert("Komentar tidak boleh kosong.");

      setSending(true);
      try {
        const payload = {
          memory_id: memoryId,
          text: text.trim(),
          commenter: name.trim() || "Anonim",
          created_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
          .from("comments")
          .insert([payload])
          .select()
          .single();

        if (error) {
          alert("Gagal mengirim komentar.");
          return;
        }

        setComments((prev) => [...prev, data as Comment]);

        if (onNewComment) onNewComment(data as Comment);

        setText("");
        setName("");
        setShowModal(false);
      } catch (err) {
        alert("Terjadi kesalahan saat mengirim komentar.");
      } finally {
        setSending(false);
      }
    };

    return (
      <section className="mt-6">
        {/* Header tanpa tombol Comment */}
        <h2 className="text-xl font-semibold mb-3">Komentar</h2>

        {/* list komentar */}
        <div className="space-y-3 mb-4">
          {loadingComments ? (
            <p className="text-gray-400">Memuat komentar...</p>
          ) : comments.length === 0 ? (
            <p className="text-gray-500 italic">Belum ada komentar 😅</p>
          ) : (
            <div className="space-y-3">
              {comments.map((c) => (
                <div
                  key={c.id}
                  className="bg-gray-800 border border-gray-700 p-3 rounded-md"
                >
                  <p className="text-gray-200 whitespace-pre-line">{c.text}</p>
                  <p className="text-xs text-gray-400 mt-2 flex justify-end">
                    oleh <span className="font-medium mx-1">{c.commenter || "Anonim"}</span> ·{" "}
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
        </div>

        {/* modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="relative w-full max-w-3xl h-full md:h-auto md:max-h-[80vh] bg-gray-900 rounded-lg border border-gray-700 overflow-auto">
              {/* header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded text-gray-300 hover:text-white"
                >
                  <X size={18} />
                </button>
                <h3 className="text-white text-lg font-semibold">Komentar</h3>
                <div className="w-6" />
              </div>

              {/* body */}
              <div className="p-4 space-y-3">
                <label className="block text-sm text-gray-300">Komentar</label>
                <textarea
                  ref={textareaRef}
                  rows={4}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full p-3 rounded bg-gray-800 border border-gray-700 text-white resize-none"
                  placeholder="Tulis komentar..."
                />

                <label className="block text-sm text-gray-300">Nama (opsional)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
                  placeholder="Nama kamu..."
                />

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setText("");
                      setName("");
                    }}
                    className="px-3 py-1 border border-gray-600 rounded text-gray-300"
                  >
                    Batal
                  </button>

                  <button
                    onClick={handleSend}
                    disabled={sending}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                  >
                    {sending ? "Mengirim..." : "Kirim"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    );
  }
);

export default CommentSection;
