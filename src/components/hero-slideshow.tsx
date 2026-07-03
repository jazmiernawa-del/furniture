"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

/**
 * Full-screen crossfading slideshow with a slow Ken-Burns zoom on each frame.
 * Renders as an absolute background; overlay your content above it.
 */
export function HeroSlideshow({
  images,
  interval = 6000,
}: {
  images: string[];
  interval?: number;
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
    <div className="absolute inset-0 overflow-hidden bg-ink">
      {images.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity duration-[2000ms] ease-in-out"
          style={{ opacity: i === active ? 1 : 0 }}
        >
          <div
            className="relative h-full w-full"
            style={{
              animation:
                i === active ? "kenburns 8s ease-out both" : undefined,
            }}
          >
            <Image
              src={src}
              alt=""
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </div>
      ))}

      {/* Slide indicators */}
      <div className="absolute bottom-8 right-6 z-20 flex gap-2 lg:right-10">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            aria-label={`Show slide ${i + 1}`}
            onClick={() => setActive(i)}
            className={`h-1 rounded-full transition-all duration-500 ${
              i === active ? "w-8 bg-accent" : "w-4 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
