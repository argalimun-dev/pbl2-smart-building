"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useParams } from "next/navigation";
import CommentSection, { CommentSectionRef } from "@/components/CommentSection";
import FullscreenViewer from "@/components/FullscreenViewer";
import DeleteModal from "@/components/DeleteModal";
import EditModal from "@/components/EditModal";

export default function MemoryDetailPage() {
  const router = useRouter();
  const params = useParams();

  // FIX: Next.js sometimes returns array
  const memoryId =
    Array.isArray(params?.id) ? params.id[0] : params?.id;

  const commentRef = useRef<CommentSectionRef>(null);

  const [memory, setMemory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [secretCode, setSecretCode] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editUploader, setEditUploader] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Fullscreen viewer
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fetch memory
  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from("memories")
        .select("*")
        .eq("id", memoryId)
        .single();

      setMemory(data);
      setLoading(false);
    };

    if (memoryId) fetchData();
  }, [memoryId]);

  // DELETE HANDLER
  const handleDelete = async () => {
    if (!secretCode.trim()) return alert("Masukkan kode rahasia!");
    if (!memory) return;

    const check = confirm("⚠️ Yakin ingin menghapus Project ini?");
    if (!check) return;

    try {
      setDeleting(true);

      // Validate code
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

      // Delete comments first
      await supabase.from("comments").delete().eq("memory_id", memory.id);

      // Delete image from storage
      const imagePath = memory.image_url?.split(
        "/storage/v1/object/public/images/"
      )[1];

      if (imagePath) {
        await supabase.storage.from("images").remove([imagePath]);
      }

      // Delete memory
      await supabase.from("memories").delete().eq("id", memory.id);

      alert("Project berhasil dihapus!");
      router.push("/memory");
      router.refresh();
    } catch {
      alert("Terjadi kesalahan saat menghapus!");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setSecretCode("");
    }
  };

  // UPDATE HANDLER
  const handleUpdateMemory = async () => {
    if (!memory) return;
    setEditLoading(true);

    try {
      let imageUrl = memory.image_url;

      // Upload new image if exists
      if (editImageFile) {
        const oldPath = memory.image_url?.split(
          "/storage/v1/object/public/images/"
        )[1];

        const ext = editImageFile.name.split(".").pop();
        const fileName = `${memory.id}-${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(fileName, editImageFile, { upsert: true });

        if (uploadError) throw uploadError;

        imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${fileName}`;

        if (oldPath) {
          await supabase.storage.from("images")
            .remove([oldPath])
            .catch(() => {});
        }
      }

      // Update DB
      const { error } = await supabase
        .from("memories")
        .update({
          title: editTitle,
          description: editDescription,
          uploader: editUploader,
          image_url: imageUrl,
        })
        .eq("id", memory.id);

      if (error) throw error;

      // Update local state
      setMemory({
        ...memory,
        title: editTitle,
        description: editDescription,
        uploader: editUploader,
        image_url: imageUrl,
      });

      alert("Berhasil disimpan!");
      setShowEditModal(false);
    } catch {
      alert("Gagal menyimpan perubahan.");
    } finally {
      setEditLoading(false);
      setEditImageFile(null);
    }
  };

  if (loading) return <p className="text-white p-6">Loading...</p>;
  if (!memory) return <p className="text-white p-6">Memory tidak ditemukan.</p>;

  return (
    <>
      <div className="max-w-3xl mx-auto p-4 sm:p-6 text-white relative">
        {/* DELETE BUTTON */}
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-700 hover:bg-red-800 text-xs px-3 py-1 rounded text-white"
          >
            Hapus
          </button>
        </div>

        <button
          onClick={() => router.push("/memory")}
          className="text-blue-400 hover:underline mb-4 block"
        >
          ← Kembali ke Smart Project Wall
        </button>

        {/* IMAGE */}
        <img
          loading="eager"
          src={memory.image_url}
          alt={memory.title}
          className="w-full rounded-lg mb-4 cursor-zoom-in object-cover"
          onClick={() => setIsFullscreen(true)}
        />

        <h1 className="text-2xl font-bold mb-2">{memory.title}</h1>
        <p className="text-gray-300 mb-2">{memory.description}</p>

        <div className="flex justify-end mt-3 text-xs text-gray-400">
          <div className="flex items-center gap-2 sm:gap-3">
            <span>
              📅{" "}
              {new Date(memory.created_at).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>

            <span className="text-gray-600">•</span>

            <span className="flex items-center gap-1">
              👤{" "}
              <span className="text-gray-300 font-medium">
                {memory.uploader}
              </span>
            </span>

            <span className="text-gray-600">•</span>

            <span
              onClick={() => {
                setEditTitle(memory.title || "");
                setEditDescription(memory.description || "");
                setEditUploader(memory.uploader || "");
                setEditImageFile(null);
                setShowEditModal(true);
              }}
              className="text-blue-400 cursor-pointer hover:underline"
            >
              Sunting
            </span>

            <span className="text-gray-600">•</span>

            <span
              onClick={() => commentRef.current?.openModal()}
              className="text-blue-400 cursor-pointer hover:underline"
            >
              Komentar
            </span>
          </div>
        </div>

        <hr className="border-gray-800 mt-3 mb-0" />

        <CommentSection memoryId={memory.id} ref={commentRef} />

        <hr className="border-gray-700 mb-3" />
      </div>

      {/* FULLSCREEN VIEWER */}
      {isFullscreen && (
        <FullscreenViewer
          imageUrl={memory.image_url}
          title={memory.title}
          onClose={() => setIsFullscreen(false)}
        />
      )}

      {/* DELETE MODAL */}
      <DeleteModal
        isOpen={showDeleteModal}
        secretCode={secretCode}
        setSecretCode={setSecretCode}
        loading={deleting}
        onCancel={() => {
          setShowDeleteModal(false);
          setSecretCode("");
        }}
        onConfirm={handleDelete}
      />

      {/* EDIT MODAL */}
      <EditModal
        isOpen={showEditModal}
        title={editTitle}
        description={editDescription}
        uploader={editUploader}
        file={editImageFile}
        setTitle={setEditTitle}
        setDescription={setEditDescription}
        setUploader={setEditUploader}
        setFile={setEditImageFile}
        onCancel={() => {
          setShowEditModal(false);
          setEditImageFile(null);
        }}
        onSave={handleUpdateMemory}
        loading={editLoading}
      />
    </>
  );
}
