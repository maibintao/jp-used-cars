"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";

interface Props {
  images: string[];
  title: string;
}

export default function ImageGallery({ images, title }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-lg bg-gray-200">
        <span className="text-sm text-gray-400">No image available</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-100">
        <img
          src={images[activeIndex]}
          alt={`${title} - image ${activeIndex + 1}`}
          className="h-full w-full object-cover"
        />
        {images.length > 1 && (
          <span className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-1 text-xs text-white">
            {activeIndex + 1} / {images.length}
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded border-2 transition-colors ${
                i === activeIndex
                  ? "border-blue-500"
                  : "border-transparent hover:border-gray-300"
              }`}
              aria-label={`Show image ${i + 1}`}
            >
              <img
                src={src}
                alt={`thumbnail ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
