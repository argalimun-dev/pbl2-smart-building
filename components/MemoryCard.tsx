export default function MemoryCard({ title, description, src }: { title: string; description: string; src: string }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-lg transition">
      <div className="h-48 flex items-center justify-center bg-gray-100">
        <img src={src} alt={title} className="max-h-full" />
      </div>
      <div className="p-4">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  )
}
