import Image from "next/image";
import Link from "next/link";
import type { Car } from "@/lib/cars";

interface CarCardProps { car: Car; }

function fmtMileage(n: number | null) {
  if (n === null) return "N/A";
  return `${new Intl.NumberFormat("en-US").format(n)} km`;
}
function fmtPrice(n: number | null) {
  if (n === null) return "Ask for price";
  return `$${new Intl.NumberFormat("en-US").format(n)}`;
}

export default function CarCard({ car }: CarCardProps) {
  const title = car.title_en || car.title_ja;
  const image = car.images[0];

  return (
    <Link href={`/car/${car.source_id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow ring-1 ring-orange-100 transition hover:-translate-y-1 hover:shadow-xl hover:ring-orange-300">
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-amber-50">
        {image ? (
          <Image src={image} alt={title} fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-105" unoptimized />
        ) : (
          <div className="flex h-full items-center justify-center text-amber-300 text-sm">No image</div>
        )}
        {car.year && (
          <span className="absolute left-3 top-3 rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-extrabold text-white shadow">
            {car.year}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <h2 className="line-clamp-2 text-sm font-bold leading-snug text-slate-800 group-hover:text-orange-700">
          {title}
        </h2>
        <p className="mt-1.5 text-xs text-slate-500">{fmtMileage(car.mileage_km)}{car.color_en ? ` · ${car.color_en}` : ""}</p>

        <div className="mt-auto pt-4">
          <div className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 p-3 text-white">
            <p className="text-[10px] font-semibold uppercase tracking-wider opacity-80">Total C&F Price</p>
            <p className="text-2xl font-extrabold">{fmtPrice(car.total_usd)}</p>
            {car.price_usd && (
              <p className="text-[10px] opacity-75">
                Car ${new Intl.NumberFormat("en-US").format(car.price_usd)} + Ship ${new Intl.NumberFormat("en-US").format(car.shipping_usd)}
              </p>
            )}
          </div>
          <span className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-bold text-white transition group-hover:bg-green-800">
            View Details →
          </span>
        </div>
      </div>
    </Link>
  );
}
