"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

/**
 * Auto-playing crossfade carousel that fills its (positioned) parent. Give the
 * parent a fixed aspect ratio + `overflow-hidden`.
 */
export function ImageCarousel({
  images,
  interval = 3500,
  sizes = "(min-width: 1024px) 55vw, 100vw",
  alt = "",
}: {
  images: string[];
  interval?: number;
  sizes?: string;
  alt?: string;
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(
      () => setActive((i) => (i + 1) % images.length),
      interval,
    );
    return () => clearInterval(id);
  }, [images.length, interval]);

  return (
    <div className="absolute inset-0">
      {images.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === active ? 1 : 0 }}
        >
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            className="object-cover"
          />
        </div>
      ))}

      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            aria-label={`Show image ${i + 1}`}
            onClick={() => setActive(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === active ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
