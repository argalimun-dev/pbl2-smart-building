import { useState } from 'react'

type Comment = { id: string; author: string; text: string }

const initialComments: Comment[] = [
  { id: 'c1', author: 'Ayu', text: 'Indah sekali!' },
  { id: 'c2', author: 'Budi', text: 'Kapan kita ke sana lagi?' }
]

export default function CommentSection({ memoryId }: { memoryId: string }) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [value, setValue] = useState('')

  function addComment(e: React.FormEvent) {
    e.preventDefault()
    if (!value.trim()) return
    const next = { id: Date.now().toString(), author: 'You', text: value.trim() }
    setComments(prev => [next, ...prev])
    setValue('')
  }

  return (
    <section className="bg-white p-4 rounded-2xl shadow">
      <h4 className="font-semibold">Komentar</h4>

      <form onSubmit={addComment} className="mt-3 flex gap-2">
        <input value={value} onChange={e => setValue(e.target.value)} placeholder="Tulis komentar..." className="flex-1 border rounded px-3 py-2" />
        <button className="px-4 py-2 bg-blue-600 text-white rounded">Kirim</button>
      </form>

      <ul className="mt-4 space-y-3">
        {comments.map(c => (
          <li key={c.id} className="border rounded px-3 py-2">
            <div className="text-sm font-medium">{c.author}</div>
            <div className="text-sm text-gray-600">{c.text}</div>
          </li>
        ))}
      </ul>
    </section>
  )
}
