import Image from "next/image";
import Link from "next/link";

interface MemoryCardProps {
  id: number;
  title: string;
  description: string;
  src: string;
}

export default function MemoryCard({ id, title, description, src }: MemoryCardProps) {
  return (
    <Link
      href={`/memory/${id}`}
      className="block bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
    >
      <div className="relative w-full h-64">
        <Image
          src={src}
          alt={title}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white truncate">{title}</h3>
        <p className="text-gray-400 text-sm line-clamp-2">{description}</p>
      </div>
    </Link>
  );
}
