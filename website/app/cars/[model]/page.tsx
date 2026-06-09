import Link from "next/link";
import CarCard from "@/components/CarCard";
import Header from "@/components/Header";
import {
  getCarsByModel,
  isModel,
  MODEL_LABELS,
  MODELS,
  type Model,
  sortNewestFirst,
} from "@/lib/cars";

interface ModelPageProps {
  params: {
    model: string;
  };
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return MODELS.map((model) => ({ model }));
}

export function generateMetadata({ params }: ModelPageProps) {
  const title = isModel(params.model)
    ? `${MODEL_LABELS[params.model]} listings`
    : "No listings found";

  return {
    title: `${title} | Japan Auto Export`,
  };
}

export default function ModelPage({ params }: ModelPageProps) {
  const activeModel: Model | undefined = isModel(params.model)
    ? params.model
    : undefined;
  const cars = activeModel
    ? sortNewestFirst(getCarsByModel(activeModel))
    : [];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <Header active={activeModel} />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/"
              className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              &lt;- Home
            </Link>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              {activeModel
                ? `${MODEL_LABELS[activeModel]} — ${cars.length} listings`
                : "No listings found"}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Sorted by newest scraped listings first.
            </p>
          </div>
        </div>

        {cars.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cars.map((car) => (
              <CarCard key={car.source_id} car={car} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-lg font-semibold text-slate-950">
              No listings found
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Please choose Prado, Hilux, or HiAce from the navigation.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
