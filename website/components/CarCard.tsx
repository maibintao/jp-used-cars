import Image from "next/image";
import Link from "next/link";
import PriceBox from "@/components/PriceBox";
import type { Car } from "@/lib/cars";

interface CarCardProps {
  car: Car;
}

function formatMileage(mileage: number | null): string {
  if (mileage === null) {
    return "Mileage unknown";
  }

  return `${new Intl.NumberFormat("en-US").format(mileage)} km`;
}

export default function CarCard({ car }: CarCardProps) {
  const title = car.title_en || car.title_ja;
  const image = car.images[0];
  const color = car.color_en || car.color_ja || "Color not listed";

  return (
    <Link
      href={`/car/${car.source_id}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] bg-slate-100">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-300 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-slate-200 text-sm font-medium text-slate-500">
            No image available
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {car.year ?? "Year unknown"} · {formatMileage(car.mileage_km)}
        </p>
        <h2 className="line-clamp-2 text-lg font-bold leading-snug text-slate-950">
          {title}
        </h2>
        <p className="text-sm text-slate-600">Color: {color}</p>
        <div className="mt-auto">
          <PriceBox
            price_usd={car.price_usd}
            shipping_usd={car.shipping_usd}
            total_usd={car.total_usd}
          />
          <span className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition group-hover:bg-emerald-700">
            View Details
          </span>
        </div>
      </div>
    </Link>
  );
}
