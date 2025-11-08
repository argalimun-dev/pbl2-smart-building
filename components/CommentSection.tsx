"use client"
import { useState, useEffect } from "react"
import { supabase } from "../lib/supabaseClient"

type Comment = { id: string; author: string; text: string; created_at: string }

export default function CommentSection({ memoryId }: { memoryId: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [value, setValue] = useState("")

  useEffect(() => {
    fetchComments()
  }, [memoryId])

  async function fetchComments() {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("memory_id", memoryId)
      .order("created_at", { ascending: false })
    if (!error && data) setComments(data)
  }

  async function addComment(e: React.FormEvent) {
    e.preventDefault()
    if (!value.trim()) return

    const { error } = await supabase.from("comments").insert({
      memory_id: memoryId,
      author: "Anon",
      text: value.trim(),
    })

    if (!error) {
      setValue("")
      fetchComments()
    }
  }

  return (
    <section className="bg-white p-4 rounded-2xl shadow">
      <h4 className="font-semibold">Komentar</h4>

      <form onSubmit={addComment} className="mt-3 flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Tulis komentar..."
          className="flex-1 border rounded px-3 py-2"
        />
        <button className="px-4 py-2 bg-blue-600 text-white rounded">Kirim</button>
      </form>

      <ul className="mt-4 space-y-3">
        {comments.map((c) => (
          <li key={c.id} className="border rounded px-3 py-2">
            <div className="text-sm font-medium">{c.author}</div>
            <div className="text-sm text-gray-600">{c.text}</div>
            <div className="text-xs text-gray-400">
              {new Date(c.created_at).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

