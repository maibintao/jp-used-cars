import Link from "next/link";
import CarCard from "@/components/CarCard";
import Header from "@/components/Header";
import {
  getAllCars,
  getUpdatedAt,
  MODEL_LABELS,
  MODELS,
  sortNewestFirst,
} from "@/lib/cars";

const defaultOgImage = getAllCars().find((car) => car.images[0])?.images[0];

export const metadata = {
  title: "JP Used Cars — Quality Japanese Used Cars",
  description:
    "Browse Toyota Prado, Hilux, HiAce and more. Updated daily from Japan.",
  openGraph: {
    images: defaultOgImage ? [{ url: defaultOgImage }] : [],
  },
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function daysAgo(value: string): string {
  const updatedAt = new Date(value).getTime();
  const now = Date.now();
  const days = Math.max(0, Math.floor((now - updatedAt) / 86_400_000));

  if (days === 0) {
    return "Updated today";
  }

  if (days === 1) {
    return "Updated 1 day ago";
  }

  return `Updated ${days} days ago`;
}

export default function Home() {
  const cars = getAllCars();
  const latestCars = sortNewestFirst(cars).slice(0, 6);
  const updatedAt = getUpdatedAt();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <Header active="home" />

      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Quality Japanese Used Cars
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              Sourced directly from Japan. Prices include shipping.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {MODELS.map((model) => (
                <Link
                  key={model}
                  href={`/cars/${model}`}
                  className="inline-flex items-center justify-center rounded-md bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-100"
                >
                  Browse {MODEL_LABELS[model].replace("Toyota ", "")}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:grid-cols-3 sm:px-6 lg:px-8">
          <div>
            <p className="text-3xl font-bold text-slate-950">{cars.length}</p>
            <p className="text-sm font-medium text-slate-500">
              Total listings available
            </p>
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-950">{MODELS.length}</p>
            <p className="text-sm font-medium text-slate-500">Models available</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-950">
              {daysAgo(updatedAt)}
            </p>
            <p className="text-sm font-medium text-slate-500">
              Last refresh {formatDate(updatedAt)}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {MODELS.map((model) => {
            const count = cars.filter((car) => car.model === model).length;

            return (
              <Link
                key={model}
                href={`/cars/${model}`}
                className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
              >
                <h2 className="text-xl font-bold text-slate-950">
                  {MODEL_LABELS[model]}
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  {count} available cars
                </p>
                <span className="mt-5 inline-flex text-sm font-bold text-emerald-700">
                  Browse -&gt;
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              Latest arrivals
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Recently refreshed listings from Japan.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {latestCars.map((car) => (
            <CarCard key={car.source_id} car={car} />
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
        Data sourced from carsensor.net · Updated daily
      </footer>
    </main>
  );
}
