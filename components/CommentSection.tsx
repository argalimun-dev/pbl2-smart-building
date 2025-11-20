"use client";

import {
  useEffect,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { supabase } from "@/lib/supabaseClient";

interface Comment {
  id: string;
  text: string;
  created_at: string;
  memory_id: string;
  commenter?: string | null;
  parent_id?: string | null;
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

    const [showModal, setShowModal] = useState(false);
    const [name, setName] = useState("");
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    // EDIT MODE STATES
    const [editId, setEditId] = useState<string | null>(null);
    const [editText, setEditText] = useState("");

    // REPLY MODE STATES (1 active reply box at a time)
    const [replyToId, setReplyToId] = useState<string | null>(null);
    const [replyText, setReplyText] = useState("");
    const [replyName, setReplyName] = useState(""); // <-- added

    useImperativeHandle(ref, () => ({
      openModal: () => setShowModal(true),
    }));

    // fetch comments
    useEffect(() => {
      if (!memoryId) return;
      fetchComments();
      // also load saved name (if any) to prefill modal name
      const saved = typeof window !== "undefined" ? localStorage.getItem(`commenter-${memoryId}`) : null;
      if (saved) setName(saved);
    }, [memoryId]);

    const fetchComments = async () => {
      setLoadingComments(true);
      try {
        const { data, error } = await supabase
          .from("comments")
          .select("*")
          .eq("memory_id", memoryId)
          .order("created_at", { ascending: true });

        if (!error && data) setComments(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingComments(false);
      }
    };

    // autosize textarea
    useEffect(() => {
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          const el = textareaRef.current;
          el.style.height = "auto";
          el.style.height = `${el.scrollHeight}px`;
        }
      });
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
          parent_id: null,
        };

        const { data, error } = await supabase
          .from("comments")
          .insert([payload])
          .select()
          .single();

        if (error || !data) {
          alert("Gagal mengirim komentar.");
          return;
        }

        // Simpan identity commenter di localStorage
        localStorage.setItem(`commenter-${memoryId}`, payload.commenter);

        setComments((prev) => [...prev, data]);
        onNewComment?.(data);

        setText("");
        setName("");
        setShowModal(false);
      } catch {
        alert("Terjadi kesalahan saat mengirim komentar.");
      } finally {
        setSending(false);
      }
    };

    // ---------------------------
    // EDIT COMMENT (works for top-level & replies)
    // ---------------------------
    const startEdit = (c: Comment) => {
      setEditId(c.id);
      setEditText(c.text);
      // hide any reply box when editing
      setReplyToId(null);
      setReplyText("");
      setReplyName("");
    };

    const cancelEdit = () => {
      setEditId(null);
      setEditText("");
    };

    const handleUpdate = async (id: string) => {
      if (!editText.trim()) return alert("Teks tidak boleh kosong.");

      try {
        const { data, error } = await supabase
          .from("comments")
          .update({ text: editText.trim() })
          .eq("id", id)
          .select()
          .single();

        if (error || !data) {
          alert("Gagal mengupdate komentar.");
          return;
        }

        setComments((prev) =>
          prev.map((c) => (c.id === id ? { ...c, text: editText.trim() } : c))
        );

        cancelEdit();
      } catch (e) {
        console.error(e);
        alert("Terjadi kesalahan saat update.");
      }
    };

    // ---------------------------
    // DELETE COMMENT (also delete its replies if parent)
    // ---------------------------
    const handleDelete = async (id: string, isParent = false) => {
      if (!confirm("Hapus komentar ini?")) return;

      try {
        // If deleting a parent comment, delete its replies first
        if (isParent) {
          await supabase.from("comments").delete().eq("parent_id", id);
        }
        // delete the comment itself
        const { error } = await supabase.from("comments").delete().eq("id", id);

        if (error) {
          alert("Gagal menghapus komentar.");
          return;
        }

        setComments((prev) => prev.filter((c) => c.id !== id && c.parent_id !== id));
      } catch (e) {
        console.error(e);
        alert("Terjadi kesalahan saat menghapus.");
      }
    };

    // ---------------------------
    // REPLY (only for top-level comments)
    // ---------------------------
    const startReply = (id: string) => {
      setReplyToId(id);
      setReplyText("");
      // prefill replyName using modal name or saved device identity (if any)
      const saved = typeof window !== "undefined" ? localStorage.getItem(`commenter-${memoryId}`) : null;
      setReplyName(name || saved || "");
      // hide any edit box when replying
      setEditId(null);
      setEditText("");
    };

    const cancelReply = () => {
      setReplyToId(null);
      setReplyText("");
      setReplyName("");
    };

    const handleSendReply = async (parentId: string) => {
      if (!replyText.trim()) return alert("Balasan tidak boleh kosong.");

      setSending(true);
      try {
        const payload = {
          memory_id: memoryId,
          text: replyText.trim(),
          commenter: replyName.trim() || "Anonim",
          created_at: new Date().toISOString(),
          parent_id: parentId,
        };

        const { data, error } = await supabase
          .from("comments")
          .insert([payload])
          .select()
          .single();

        if (error || !data) {
          alert("Gagal mengirim balasan.");
          return;
        }

        // Save commenter identity for this device
        localStorage.setItem(`commenter-${memoryId}`, payload.commenter);

        setComments((prev) => [...prev, data]);
        onNewComment?.(data);

        cancelReply();
      } catch (e) {
        console.error(e);
        alert("Terjadi kesalahan saat mengirim balasan.");
      } finally {
        setSending(false);
      }
    };

    // identity for this device (who can edit/delete)
    const deviceIdentity =
      typeof window !== "undefined"
        ? localStorage.getItem(`commenter-${memoryId}`)
        : null;

    // prepare lists: top-level comments and mapping replies (1 level)
    const topLevelComments = comments.filter((c) => !c.parent_id);
    const repliesMap: Record<string, Comment[]> = {};
    comments.forEach((c) => {
      if (c.parent_id) {
        if (!repliesMap[c.parent_id]) repliesMap[c.parent_id] = [];
        repliesMap[c.parent_id].push(c);
      }
    });

    return (
      <section className="mt-6">
        <h2 className="text-xl font-semibold mb-3">Komentar</h2>

        {/* list komentar */}
        <div className="space-y-3 mb-4">
          {loadingComments ? (
            <p className="text-gray-400">Memuat komentar...</p>
          ) : comments.length === 0 ? (
            <p className="text-gray-500 italic">Belum ada komentar 😅</p>
          ) : (
            <div className="space-y-3">
              {topLevelComments.map((c) => {
                const isOwner = deviceIdentity === c.commenter;

                const replies = repliesMap[c.id] || [];

                return (
                  <div key={c.id} className="space-y-2">
                    <div className="bg-gray-800 border border-gray-700 p-3 rounded-md">
                      {editId === c.id ? (
                        <div>
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full p-2 rounded bg-gray-700 text-white"
                          />
                          <div className="flex gap-2 mt-2 justify-end">
                            <button
                              onClick={cancelEdit}
                              className="px-3 py-1 rounded border border-gray-600 text-gray-300"
                            >
                              Batal
                            </button>
                            <button
                              onClick={() => handleUpdate(c.id)}
                              className="px-3 py-1 rounded bg-green-600 text-white"
                            >
                              Simpan
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-gray-200 whitespace-pre-line">
                            {c.text}
                          </p>

                          <p className="text-xs text-gray-400 mt-2 flex justify-between items-center">
                            <span>
                              oleh{" "}
                              <span className="font-medium mx-1">
                                {c.commenter || "Anonim"}
                              </span>
                              ·{" "}
                              {new Date(c.created_at).toLocaleString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>

                            <span className="flex gap-3 text-sm">
                              {/* Reply available only for top-level comments */}
                              <button
                                onClick={() => startReply(c.id)}
                                className="text-sky-300 hover:text-sky-200"
                              >
                                Reply
                              </button>

                              {isOwner && (
                                <>
                                  <button
                                    onClick={() => startEdit(c)}
                                    className="text-blue-400 hover:text-blue-300"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(c.id, true)}
                                    className="text-red-400 hover:text-red-300"
                                  >
                                    Hapus
                                  </button>
                                </>
                              )}
                            </span>
                          </p>
                        </>
                      )}
                    </div>

                    {/* reply box (inline) for this top-level comment */}
                    {replyToId === c.id && (
                      <div className="ml-6">
                        <div className="bg-gray-850 border border-gray-700 p-3 rounded-md">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="w-full p-2 rounded bg-gray-800 text-white"
                            placeholder="Tulis balasan..."
                          />

                          <input
                            type="text"
                            value={replyName}
                            onChange={(e) => setReplyName(e.target.value)}
                            className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white mb-2"
                            placeholder="Nama kamu..."
                          />
                          <div className="flex gap-2 mt-2 justify-end">
                            <button
                              onClick={cancelReply}
                              className="px-3 py-1 rounded border border-gray-600 text-gray-300"
                            >
                              Batal
                            </button>
                            <button
                              onClick={() => handleSendReply(c.id)}
                              disabled={sending}
                              className="px-3 py-1 rounded bg-blue-600 text-white"
                            >
                              {sending ? "Mengirim..." : "Balas"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* replies list (1 level, indented) */}
                    {replies.length > 0 && (
                      <div className="ml-6 space-y-2">
                        {replies.map((r) => {
                          const isReplyOwner = deviceIdentity === r.commenter;
                          return (
                            <div
                              key={r.id}
                              className="bg-gray-800 border border-gray-700 p-3 rounded-md"
                            >
                              {editId === r.id ? (
                                <div>
                                  <textarea
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    className="w-full p-2 rounded bg-gray-700 text-white"
                                  />
                                  <div className="flex gap-2 mt-2 justify-end">
                                    <button
                                      onClick={cancelEdit}
                                      className="px-3 py-1 rounded border border-gray-600 text-gray-300"
                                    >
                                      Batal
                                    </button>
                                    <button
                                      onClick={() => handleUpdate(r.id)}
                                      className="px-3 py-1 rounded bg-green-600 text-white"
                                    >
                                      Simpan
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <p className="text-gray-200 whitespace-pre-line">
                                    {r.text}
                                  </p>

                                  <p className="text-xs text-gray-400 mt-2 flex justify-between items-center">
                                    <span>
                                      oleh{" "}
                                      <span className="font-medium mx-1">
                                        {r.commenter || "Anonim"}
                                      </span>
                                      ·{" "}
                                      {new Date(r.created_at).toLocaleString(
                                        "id-ID",
                                        {
                                          day: "numeric",
                                          month: "short",
                                          year: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        }
                                      )}
                                    </span>

                                    <span className="flex gap-3 text-sm">
                                      {isReplyOwner && (
                                        <>
                                          <button
                                            onClick={() => startEdit(r)}
                                            className="text-blue-400 hover:text-blue-300"
                                          >
                                            Edit
                                          </button>
                                          <button
                                            onClick={() => handleDelete(r.id, false)}
                                            className="text-red-400 hover:text-red-300"
                                          >
                                            Hapus
                                          </button>
                                        </>
                                      )}
                                    </span>
                                  </p>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* modal (unchanged behavior) */}
        {showModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() => setShowModal(false)}
          >
            <div
              className="
                relative 
                w-full 
                max-w-full 
                sm:max-w-md 
                md:max-w-lg 
                lg:max-w-xl 
                bg-gray-900 
                rounded-lg 
                border border-gray-700 
                p-4 
                overflow-auto
              "
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-white text-lg font-semibold mb-4 text-center">
                Tulis Komentar
              </h3>

              <label className="block text-sm text-gray-300">Komentar</label>
              <textarea
                ref={textareaRef}
                rows={4}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full p-3 rounded bg-gray-800 border border-gray-700 text-white resize-none"
                placeholder="Tulis komentar..."
              />

              <label className="block text-sm text-gray-300 mt-3">
                Nama (opsional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
                placeholder="Nama kamu..."
              />

              <div className="flex justify-end gap-2 mt-4">
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
        )}
      </section>
    );
  }
);

export default CommentSection;
