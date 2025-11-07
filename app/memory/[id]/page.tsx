import { use } from 'react'
import CommentSection from '../../../components/CommentSection'
import Link from 'next/link'

// In a real app you'd fetch data by id.
const sample = {
  id: '1',
  title: 'Sunset at the Lake',
  description: 'A beautiful sunset we watched together.',
  src: '/images/sunset.svg',
  date: '2025-11-08'
}

export default function MemoryPage({ params }: { params: { id: string } }) {
  // For now show the sample regardless of id.
  return (
    <div>
      <Link href="/"><a className="text-sm text-blue-600 hover:underline">&larr; Back to gallery</a></Link>

      <article className="mt-4 bg-white p-6 rounded-2xl shadow">
        <img src={sample.src} alt={sample.title} className="w-full h-64 object-cover rounded-lg" />
        <h2 className="text-2xl font-semibold mt-4">{sample.title}</h2>
        <p className="text-gray-600 mt-2">{sample.description}</p>
        <p className="text-sm text-gray-400 mt-1">Date: {sample.date}</p>
      </article>

      <div className="mt-6">
        <CommentSection memoryId={sample.id} />
      </div>
    </div>
  )
}
