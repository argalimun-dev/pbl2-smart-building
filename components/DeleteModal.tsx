"use client";

import React from "react";

interface Props {
  isOpen: boolean;
  secretCode: string;
  setSecretCode: (v: string) => void;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteModal({
  isOpen,
  secretCode,
  setSecretCode,
  loading,
  onCancel,
  onConfirm,
}: Props) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn"
      onClick={() => !loading && onCancel()}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-gray-900 p-6 rounded-xl border border-gray-700 w-[90%] max-w-md shadow-lg animate-zoomIn"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-white mb-4">Hapus Project?</h2>

        <p className="text-sm text-gray-300 mb-4 leading-relaxed">
          Masukkan kode rahasia untuk menghapus Project ini.
        </p>

        <input
          type="password"
          placeholder="Kode rahasia"
          value={secretCode}
          onChange={(e) => setSecretCode(e.target.value)}
          disabled={loading}
          className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white mb-4 disabled:opacity-50"
        />

        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-3 py-1 border border-gray-600 rounded text-gray-300 hover:bg-gray-700 disabled:opacity-50"
          >
            Batal
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded disabled:opacity-50"
          >
            {loading ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}
