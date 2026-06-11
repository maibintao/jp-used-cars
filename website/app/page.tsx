import Link from "next/link";
import CarCard from "@/components/CarCard";
import Header from "@/components/Header";
import { getAllCars, getUpdatedAt, MODEL_LABELS, MODELS, sortNewestFirst } from "@/lib/cars";

const defaultOgImage = getAllCars().find((c) => c.images[0])?.images[0];

export const metadata = {
  title: "Japan Used Cars — Quality Imports to Africa",
  description: "Toyota, Nissan, Mazda, Audi & more. All prices include C&F shipping to Africa.",
  openGraph: { images: defaultOgImage ? [{ url: defaultOgImage }] : [] },
};

const BRAND_GROUPS = [
  { brand: "Toyota", emoji: "🚙", models: ["hilux","landcruiser","prado","lc250","hiace","harrier","alphard","voxy","rav4","prius","noah","crown"] },
  { brand: "Suzuki", emoji: "🚙", models: ["jimny"] },
  { brand: "Nissan", emoji: "🚗", models: ["xtrail"] },
  { brand: "Mazda",  emoji: "🚗", models: ["cx5"] },
  { brand: "Mitsubishi", emoji: "🚙", models: ["pajero","triton"] },
  { brand: "Honda",  emoji: "🚗", models: ["crv"] },
];

const BRAND_BG: Record<string, string> = {
  Toyota: "bg-red-600", Lexus: "bg-slate-800", Nissan: "bg-blue-700",
  Mazda: "bg-rose-700", Audi: "bg-zinc-700", Mitsubishi: "bg-red-700", Honda: "bg-red-600",
};

function formatDate(v: string) {
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(new Date(v));
}

export default function Home() {
  const cars = getAllCars();
  const latestCars = sortNewestFirst(cars).slice(0, 6);
  const updatedAt = getUpdatedAt();

  return (
    <main className="min-h-screen bg-amber-50">
      <Header active="home" />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-900 via-green-800 to-emerald-900">
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:"repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)", backgroundSize:"20px 20px"}} />
        {/* Orange accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-400" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">
                🇯🇵 Direct from Japan
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-700 border border-green-500 px-3 py-1 text-xs font-bold text-green-100">
                🌍 Delivery to Africa
              </span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Quality Japanese<br/>
              <span className="text-amber-400">Used Cars</span>
            </h1>
            <p className="mt-4 text-lg text-green-100 max-w-xl">
              {cars.length}+ vehicles available. Prices include <strong className="text-amber-400">C&F shipping</strong> — what you see is what you pay.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/cars/prado" className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-extrabold text-white shadow-lg transition hover:bg-orange-600">
                Land Cruiser Prado
              </Link>
              <Link href="/cars/hilux" className="rounded-xl bg-amber-500 px-6 py-3 text-sm font-extrabold text-white shadow-lg transition hover:bg-amber-600">
                Toyota Hilux
              </Link>
              <Link href="/cars/landcruiser" className="rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/20">
                Land Cruiser
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500">
        <div className="mx-auto grid max-w-7xl grid-cols-3 divide-x divide-white/30 px-4 sm:px-6 lg:px-8">
          {[
            { value: `${cars.length}+`, label: "Vehicles Available" },
            { value: `${MODELS.length}`, label: "Car Models" },
            { value: "Daily", label: `Updated ${formatDate(updatedAt)}` },
          ].map(({ value, label }) => (
            <div key={label} className="py-4 text-center">
              <p className="text-2xl font-extrabold text-white sm:text-3xl">{value}</p>
              <p className="text-xs font-semibold text-orange-100">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Browse by brand */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-2xl font-extrabold text-green-900">Browse by Model</h2>
        <div className="space-y-8">
          {BRAND_GROUPS.map(({ brand, emoji, models }) => (
            <div key={brand}>
              <div className="mb-3 flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 rounded-lg ${BRAND_BG[brand]} px-3 py-1 text-xs font-bold text-white`}>
                  {emoji} {brand}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {models.filter(m => MODELS.includes(m)).map((model) => {
                  const count = cars.filter(c => c.model === model).length;
                  const sample = cars.find(c => c.model === model && c.images[0]);
                  return (
                    <Link key={model} href={`/cars/${model}`}
                      className="group relative overflow-hidden rounded-2xl border-2 border-transparent bg-white shadow transition hover:border-orange-400 hover:shadow-lg">
                      {sample?.images[0] && (
                        <div className="aspect-[4/3] overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={sample.images[0]} alt="" className="h-full w-full object-cover transition group-hover:scale-105" />
                        </div>
                      )}
                      <div className="p-3">
                        <p className="text-sm font-bold text-slate-800 group-hover:text-orange-700">
                          {MODEL_LABELS[model].replace("Toyota ","").replace("Mitsubishi ","").replace("Nissan ","").replace("Mazda ","").replace("Honda ","")}
                        </p>
                        <p className="text-xs font-semibold text-orange-500">{count} listings</p>
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
      <section className="bg-gradient-to-b from-amber-50 to-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-green-900">Latest Arrivals</h2>
            <span className="text-xs text-slate-400">Updated {formatDate(updatedAt)}</span>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latestCars.map((car) => <CarCard key={car.source_id} car={car} />)}
          </div>
        </div>
      </section>

      {/* Why buy */}
      <section className="bg-green-900 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-2xl font-extrabold text-white">Why Buy From Us?</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { icon: "✅", title: "C&F Price Included", desc: "All prices include freight to your port. No hidden charges." },
              { icon: "🚢", title: "Direct from Japan", desc: "Source directly from Japan's largest used car market — carsensor.net." },
              { icon: "📋", title: "Daily Updated Stock", desc: "Listings refreshed every day so you always see current availability." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-green-700 bg-green-800 p-6 text-center">
                <div className="text-4xl mb-3">{icon}</div>
                <h3 className="font-bold text-amber-400 mb-1">{title}</h3>
                <p className="text-sm text-green-200">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-amber-200 bg-amber-50 py-8 text-center text-xs text-slate-500">
        <p className="font-semibold text-green-900">Japan Used Cars — Direct Import Specialists</p>
        <p className="mt-1">Data sourced from carsensor.net · Updated daily · All prices C&F</p>
        <p className="mt-1"><a href="mailto:info@jpusedcars.com" className="text-orange-600 hover:underline">info@jpusedcars.com</a></p>
      </footer>
    </main>
  );
}
