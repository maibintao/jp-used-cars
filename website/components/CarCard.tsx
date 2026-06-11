import Image from "next/image";
import Link from "next/link";
import type { Car } from "@/lib/cars";

interface CarCardProps {
  car: Car;
}

function formatMileage(mileage: number | null): string {
  if (mileage === null) return "Mileage N/A";
  return `${new Intl.NumberFormat("en-US").format(mileage)} km`;
}

function formatPrice(usd: number | null): string {
  if (usd === null) return "Price on request";
  return `$${new Intl.NumberFormat("en-US").format(usd)}`;
}

export default function CarCard({ car }: CarCardProps) {
  const title = car.title_en || car.title_ja;
  const image = car.images[0];

  return (
    <Link
      href={`/car/${car.source_id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-lg hover:ring-blue-300"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400 text-sm">
            No image
          </div>
        )}
        {/* Year badge */}
        {car.year && (
          <span className="absolute left-3 top-3 rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-bold text-white shadow">
            {car.year}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h2 className="line-clamp-2 text-sm font-bold leading-snug text-slate-800 group-hover:text-blue-700">
          {title}
        </h2>

        <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatMileage(car.mileage_km)}
          </span>
          {car.color_en && (
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
              </svg>
              {car.color_en}
            </span>
          )}
        </div>

        <div className="mt-auto pt-4">
          {/* Price block */}
          <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-500">Total C&F</span>
              <span className="text-xl font-extrabold text-blue-700">
                {formatPrice(car.total_usd)}
              </span>
            </div>
            {car.price_usd && car.shipping_usd && (
              <p className="mt-0.5 text-right text-xs text-slate-400">
                Car ${new Intl.NumberFormat("en-US").format(car.price_usd)} + Ship ${new Intl.NumberFormat("en-US").format(car.shipping_usd)}
              </p>
            )}
          </div>

          <span className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition group-hover:bg-blue-700">
            View Details
            <svg className="h-4 w-4 transition group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
