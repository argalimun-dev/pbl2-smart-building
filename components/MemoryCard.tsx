import Image from "next/image";
import Link from "next/link";

interface MemoryCardProps {
  id: string;
  title: string;
  description: string;
  src: string;
}

export default function MemoryCard({ id, title, description, src }: MemoryCardProps) {
  return (
    <Link
      href={`/memory/${id}`}
      className="block" // PATCH: stabil click-area di semua browser
    >
      <div
        className="
          bg-gradient-to-b from-gray-800 to-gray-900 
          rounded-xl overflow-hidden shadow-md 
          transition-transform duration-200 
          hover:scale-[1.03] active:scale-[0.98]  // PATCH: lebih smooth di mobile
        "
      >
        <div className="relative w-full h-64">
          <Image
            src={src}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={false} // PATCH: explicit, supaya tidak dianggap "auto priority"
          />
        </div>

        <div className="p-4 text-white">
          <h3 className="text-lg font-semibold truncate">{title}</h3>
          <p className="text-gray-300 text-sm line-clamp-2">
            {description || "Tidak ada deskripsi." /* PATCH: safe fallback */}
          </p>
        </div>
      </div>
    </Link>
  );
}
