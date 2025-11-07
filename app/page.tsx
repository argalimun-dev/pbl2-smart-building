import Link from 'next/link'
import MemoryCard from '../components/MemoryCard'

// Mock data
const memories = [
  {
    id: '1',
    title: 'Sunset at the Lake',
    description: 'A beautiful sunset we watched together.',
    src: '/images/sunset.svg'
  },
  {
    id: '2',
    title: 'Graduation Day',
    description: 'Celebrating a milestone.',
    src: '/images/graduation.svg'
  },
  {
    id: '3',
    title: 'Family Picnic',
    description: 'A sunny afternoon with family.',
    src: '/images/picnic.svg'
  }
]

export default function Page() {
  return (
    <>
      <header className="mb-6">
        <h1 className="text-3xl font-semibold">Memory Wall</h1>
        <p className="text-gray-600 mt-1">Simpan dan tampilkan kenangan Anda.</p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {memories.map(m => (
          <Link key={m.id} href={`/memory/${m.id}`}>
            <a>
              <MemoryCard title={m.title} description={m.description} src={m.src} />
            </a>
          </Link>
        ))}
      </section>
    </>
  )
}
