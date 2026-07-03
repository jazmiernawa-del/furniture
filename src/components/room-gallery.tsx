import Image from "next/image";

import { roomImages } from "@/lib/images";

const HANDLES = [
  "@the.oak.house",
  "@studio.laurent",
  "@marble.and.linen",
  "@casa_del_sol",
  "@nordic.nest",
  "@the.velvet.room",
];

/** Real-life customer setups, shown as an editorial gallery. */
export function RoomGallery() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
      {roomImages.map((src, i) => (
        <div
          key={src}
          className={`zoom-parent group relative overflow-hidden rounded-sm bg-muted ${
            i === 0 ? "col-span-2 aspect-[16/10] lg:col-span-1 lg:aspect-[4/5]" : "aspect-[4/5]"
          }`}
        >
          <Image
            src={src}
            alt={`A customer's room styled with Maison pieces`}
            fill
            sizes="(min-width: 1024px) 33vw, 50vw"
            className="zoom-img object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <span className="absolute bottom-3 left-3 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-white opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            {HANDLES[i % HANDLES.length]}
          </span>
        </div>
      ))}
    </div>
  );
}
