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
  title: "Japan Used Cars — Quality Japanese Imports",
  description: "Browse Toyota Prado, Hilux, HiAce, Harrier, Alphard and more. Prices include C&F shipping.",
  openGraph: { images: defaultOgImage ? [{ url: defaultOgImage }] : [] },
};

const BRAND_GROUPS = [
  { brand: "Toyota", models: ["prado","hilux","hiace","landcruiser","harrier","rav4","crown","voxy","noah","alphard"] },
  { brand: "Lexus", models: ["lexus_lx"] },
  { brand: "Nissan", models: ["xtrail"] },
  { brand: "Mazda", models: ["cx3","cx5"] },
  { brand: "Audi", models: ["audi_q7","audi_q8"] },
  { brand: "Mitsubishi", models: ["pajero"] },
  { brand: "Honda", models: ["crv"] },
];

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(new Date(value));
}

function daysAgo(value: string): string {
  const days = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000));
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

const BRAND_COLORS: Record<string, string> = {
  Toyota: "from-red-500 to-red-600",
  Lexus: "from-slate-700 to-slate-900",
  Nissan: "from-blue-500 to-blue-700",
  Mazda: "from-rose-500 to-red-700",
  Audi: "from-zinc-600 to-zinc-800",
  Mitsubishi: "from-red-600 to-orange-600",
  Honda: "from-red-500 to-red-700",
};

export default function Home() {
  const cars = getAllCars();
  const latestCars = sortNewestFirst(cars).slice(0, 6);
  const updatedAt = getUpdatedAt();

  return (
    <main className="min-h-screen bg-slate-50">
      <Header active="home" />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-800 via-blue-700 to-indigo-700">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:"url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}}/>
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
              🇯🇵 Direct from Japan · Updated daily
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Japanese Used Cars<br/>
              <span className="text-blue-200">Worldwide Delivery</span>
            </h1>
            <p className="mt-4 text-lg text-blue-100">
              {cars.length}+ vehicles available. All prices include C&F shipping — no hidden costs.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/cars/prado" className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-700 shadow transition hover:bg-blue-50">
                Browse Prado
              </Link>
              <Link href="/cars/hilux" className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-700 shadow transition hover:bg-blue-50">
                Browse Hilux
              </Link>
              <Link href="/cars/landcruiser" className="rounded-xl bg-white/15 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/25">
                Land Cruiser
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-3 divide-x divide-slate-200 px-4 sm:px-6 lg:px-8">
          <div className="py-5 text-center">
            <p className="text-3xl font-extrabold text-blue-700">{cars.length}</p>
            <p className="text-xs font-medium text-slate-500">Vehicles listed</p>
          </div>
          <div className="py-5 text-center">
            <p className="text-3xl font-extrabold text-blue-700">{MODELS.length}</p>
            <p className="text-xs font-medium text-slate-500">Models available</p>
          </div>
          <div className="py-5 text-center">
            <p className="text-2xl font-extrabold text-blue-700">{daysAgo(updatedAt)}</p>
            <p className="text-xs font-medium text-slate-500">Last updated {formatDate(updatedAt)}</p>
          </div>
        </div>
      </section>

      {/* Browse by brand */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-2xl font-extrabold text-slate-800">Browse by Model</h2>
        <div className="space-y-8">
          {BRAND_GROUPS.map(({ brand, models }) => (
            <div key={brand}>
              <div className="mb-3 flex items-center gap-3">
                <span className={`inline-flex items-center rounded-lg bg-gradient-to-r ${BRAND_COLORS[brand]} px-3 py-1 text-xs font-bold text-white`}>
                  {brand}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {models.filter(m => MODELS.includes(m)).map((model) => {
                  const count = cars.filter((c) => c.model === model).length;
                  const sample = cars.find((c) => c.model === model && c.images[0]);
                  return (
                    <Link
                      key={model}
                      href={`/cars/${model}`}
                      className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                    >
                      {sample?.images[0] && (
                        <div className="aspect-[4/3] overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={sample.images[0]} alt="" className="h-full w-full object-cover transition group-hover:scale-105" />
                        </div>
                      )}
                      <div className="p-3">
                        <p className="text-sm font-bold text-slate-800 group-hover:text-blue-700">
                          {MODEL_LABELS[model].replace("Toyota ", "").replace("Mitsubishi ", "").replace("Nissan ", "").replace("Mazda ", "").replace("Honda ", "")}
                        </p>
                        <p className="text-xs text-slate-500">{count} listings</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Latest arrivals */}
      <section className="bg-gradient-to-b from-slate-50 to-white pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-slate-800">Latest Arrivals</h2>
            <span className="text-xs text-slate-400">Updated {formatDate(updatedAt)}</span>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latestCars.map((car) => (
              <CarCard key={car.source_id} car={car} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-400">
        <p>Data sourced from carsensor.net · Updated daily · All prices C&F</p>
        <p className="mt-1">
          <a href="mailto:info@jpusedcars.com" className="text-blue-500 hover:underline">info@jpusedcars.com</a>
        </p>
      </footer>
    </main>
  );
}
