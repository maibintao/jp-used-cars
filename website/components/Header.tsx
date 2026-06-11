import Link from "next/link";
import { MODEL_LABELS, MODELS, type Model } from "@/lib/cars";

type ActiveNav = "home" | Model | "contact";
interface HeaderProps { active?: ActiveNav; }

export default function Header({ active }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 shadow-lg">
      {/* Brand bar */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-500">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-sm font-black text-white shadow-inner">🚗</span>
            <div>
              <span className="block text-base font-extrabold tracking-tight text-white leading-tight">Japan Used Cars</span>
              <span className="block text-[10px] font-medium text-orange-100 leading-tight">Direct Import · Africa Delivery</span>
            </div>
          </Link>
          <a href="mailto:info@jpusedcars.com"
            className="hidden rounded-full border border-white/40 bg-white/15 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-white/25 sm:block">
            ✉ Enquire Now
          </a>
        </div>
      </div>

      {/* Model nav */}
      <div className="bg-green-900 border-b border-green-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="-mx-4 flex overflow-x-auto px-4 sm:mx-0 sm:overflow-visible sm:px-0">
            <Link href="/"
              className={`flex-shrink-0 whitespace-nowrap border-b-2 px-4 py-2.5 text-xs font-bold transition ${
                active === "home" ? "border-amber-400 text-amber-400" : "border-transparent text-green-300 hover:text-amber-400"
              }`}>
              All Models
            </Link>
            {MODELS.map((model) => (
              <Link key={model} href={`/cars/${model}`}
                className={`flex-shrink-0 whitespace-nowrap border-b-2 px-4 py-2.5 text-xs font-bold transition ${
                  active === model ? "border-amber-400 text-amber-400" : "border-transparent text-green-300 hover:text-amber-400"
                }`}>
                {MODEL_LABELS[model]
                  .replace("Toyota ", "").replace("Mitsubishi ", "").replace("Nissan ", "")
                  .replace("Mazda ", "").replace("Honda ", "")}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
