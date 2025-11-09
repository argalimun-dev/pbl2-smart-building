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
    <div
      className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-md 
                 transition-transform transform hover:scale-105 duration-200"
    >
      <Link href={`/memory/${id}`}>
        <div className="relative w-full h-64">
          <Image
            src={src}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        <div className="p-4 text-white">
          <h3 className="text-lg font-semibold truncate">{title}</h3>
          <p className="text-gray-300 text-sm line-clamp-2">{description}</p>
        </div>
      </Link>
    </div>
  );
}
