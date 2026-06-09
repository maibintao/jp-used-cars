"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";

interface ImageGalleryProps {
  images: string[];
  title: string;
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(images[0] ?? "");

  if (images.length === 0 || selectedImage === "") {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-lg bg-slate-200 text-sm font-medium text-slate-500">
        No image available
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
        <img
          src={selectedImage}
          alt={title}
          crossOrigin="anonymous"
          className="aspect-[4/3] w-full object-cover"
        />
      </div>
      {images.length > 1 ? (
        <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setSelectedImage(image)}
              className={[
                "overflow-hidden rounded-md border bg-slate-100 transition",
                selectedImage === image
                  ? "border-emerald-600 ring-2 ring-emerald-200"
                  : "border-slate-200 hover:border-slate-400",
              ].join(" ")}
              aria-label={`Show image ${index + 1}`}
            >
              <img
                src={image}
                alt={`${title} thumbnail ${index + 1}`}
                crossOrigin="anonymous"
                className="aspect-[4/3] w-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
