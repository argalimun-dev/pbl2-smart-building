import MemoryCard from "../components/MemoryCard"
import { supabase } from "../lib/supabaseClient"

export default async function Page() {
  const { data: memories, error } = await supabase
    .from("memories")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error(error)
    return <p className="text-red-500">Gagal memuat data dari Supabase.</p>
  }

  return (
    <>
      <header className="mb-6">
        <h1 className="text-3xl font-semibold">Memory Wall</h1>
        <p className="text-gray-600 mt-1">Simpan dan tampilkan kenangan Anda.</p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {memories?.map((m) => (
          <MemoryCard
            key={m.id}
            title={m.title}
            description={m.description}
            src={m.image_url}
          />
        ))}
      </section>
    </>
  )
}
