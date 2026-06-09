import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import ImageGallery from "@/components/ImageGallery";
import PriceBox from "@/components/PriceBox";
import {
  getAllCars,
  getCarById,
  isModel,
  MODEL_LABELS,
  MODELS,
  type Model,
} from "@/lib/cars";

interface CarDetailPageProps {
  params: {
    id: string;
  };
}

const WHATSAPP_NUMBER = "+8190000000000";

export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllCars().map((car) => ({ id: car.source_id }));
}

export function generateMetadata({ params }: CarDetailPageProps) {
  const car = getCarById(params.id);
  const title = car ? car.title_en || car.title_ja : "Car not found";

  return {
    title: `${title} | Japan Auto Export`,
  };
}

function formatMileage(mileage: number | null): string {
  if (mileage === null) {
    return "Mileage unknown";
  }

  return `${new Intl.NumberFormat("en-US").format(mileage)} km`;
}

function modelDisplayName(model: string): string {
  if (!isModel(model)) {
    return model;
  }

  return MODEL_LABELS[model].replace("Toyota ", "");
}

export default function CarDetailPage({ params }: CarDetailPageProps) {
  const car = getCarById(params.id);

  if (!car) {
    notFound();
  }

  const title = car.title_en || car.title_ja;
  const activeModel: Model | undefined = isModel(car.model) ? car.model : undefined;
  const color = car.color_en || car.color_ja || "Color not listed";
  const description = car.description_en || car.description_ja;
  const whatsappText = encodeURIComponent(
    `Hi, I'm interested in ${title} (ID: ${car.source_id})`,
  );
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER.replace(
    /\D/g,
    "",
  )}?text=${whatsappText}`;
  const specs = Object.entries(car.specs);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <Header active={activeModel} />
      <article className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
          <ImageGallery images={car.images} title={title} />

          <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="inline-flex rounded-md bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">
              {modelDisplayName(car.model)}
            </p>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              {title}
            </h1>
            <p className="mt-3 text-sm font-semibold text-slate-600">
              {car.year ?? "Year unknown"} · {formatMileage(car.mileage_km)}
            </p>
            <p className="mt-2 text-sm text-slate-600">Color: {color}</p>

            <div className="mt-6">
              <PriceBox
                price_usd={car.price_usd}
                shipping_usd={car.shipping_usd}
                total_usd={car.total_usd}
              />
            </div>

            <div className="mt-6 grid gap-3">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
              >
                <span aria-hidden="true" className="mr-2">
                  💬
                </span>
                Inquire via WhatsApp
              </a>
              <a
                href={car.detail_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:border-slate-400 hover:bg-slate-50"
              >
                View on Carsensor.net -&gt;
              </a>
            </div>
          </aside>
        </div>

        <section className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-bold text-slate-950">Specs</h2>
            {specs.length > 0 ? (
              <div className="mt-4 overflow-hidden rounded-md border border-slate-200">
                <table className="w-full border-collapse text-sm">
                  <tbody>
                    {specs.map(([label, value]) => (
                      <tr key={label} className="border-b border-slate-200 last:border-0">
                        <th className="w-2/5 bg-slate-50 px-4 py-3 text-left font-semibold text-slate-700">
                          {label}
                        </th>
                        <td className="px-4 py-3 text-slate-700">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-600">
                Detailed specs are not available for this listing.
              </p>
            )}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-bold text-slate-950">Description</h2>
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-700">
              {description || "No description available for this listing."}
            </p>
          </div>
        </section>

        {MODELS.includes(car.model as (typeof MODELS)[number]) ? (
          <Link
            href={`/cars/${car.model}`}
            className="mt-8 inline-flex text-sm font-bold text-emerald-700 hover:text-emerald-800"
          >
            &lt;- Back to {modelDisplayName(car.model)} listings
          </Link>
        ) : null}
      </article>
    </main>
  );
}
