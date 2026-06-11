import Link from "next/link";
import Header from "@/components/Header";
import CarGrid from "@/components/CarGrid";
import {
  getCarsByModel,
  isModel,
  MODEL_LABELS,
  MODELS,
  sortNewestFirst,
  type Model,
} from "@/lib/cars";

interface ModelPageProps {
  params: { model: string };
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return MODELS.map((model) => ({ model }));
}

export function generateMetadata({ params }: ModelPageProps) {
  const label = isModel(params.model) ? MODEL_LABELS[params.model] : params.model;
  const image = getCarsByModel(params.model).find((car) => car.images[0])?.images[0];
  return {
    title: `${label} — Japan Used Cars`,
    description: `Browse used ${label} listings imported from Japan. All prices include C&F shipping.`,
    openGraph: { images: image ? [{ url: image }] : [] },
  };
}

export default function ModelPage({ params }: ModelPageProps) {
  const activeModel: Model | undefined = isModel(params.model) ? params.model : undefined;
  const cars = activeModel ? sortNewestFirst(getCarsByModel(activeModel)) : [];
  const label = activeModel ? MODEL_LABELS[activeModel] : params.model;

  return (
    <main className="min-h-screen bg-amber-50">
      <Header active={activeModel} />

      {/* Page header */}
      <div className="bg-gradient-to-r from-green-900 via-green-800 to-emerald-900 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-sm font-medium text-green-300 hover:text-amber-400">
            ← All Models
          </Link>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {label}
          </h1>
          <p className="mt-1 text-green-300 text-sm">
            All prices include shipping (C&F) — ready to import
          </p>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {cars.length > 0 ? (
          <CarGrid cars={cars} modelLabel={label} />
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-bold text-slate-700">No listings found</p>
            <p className="mt-1 text-sm text-slate-500">Please select a model from the navigation.</p>
          </div>
        )}
      </section>
    </main>
  );
}
