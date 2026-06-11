import Link from "next/link";
import { MODEL_LABELS, MODELS, type Model } from "@/lib/cars";

type ActiveNav = "home" | Model | "contact";

interface HeaderProps {
  active?: ActiveNav;
}

export default function Header({ active }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 shadow-md">
      {/* Top bar */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-base font-black text-white">JP</span>
            <span className="text-lg font-extrabold tracking-tight text-white">
              Japan Used Cars
            </span>
          </Link>
          <a
            href="mailto:info@jpusedcars.com"
            className="hidden rounded-full border border-white/40 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20 sm:block"
          >
            ✉ Contact Us
          </a>
        </div>
      </div>

      {/* Nav bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="-mx-4 flex overflow-x-auto px-4 sm:mx-0 sm:overflow-visible sm:px-0">
            <Link
              href="/"
              className={`flex-shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition whitespace-nowrap ${
                active === "home"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-blue-600"
              }`}
            >
              All Models
            </Link>
            {MODELS.map((model) => (
              <Link
                key={model}
                href={`/cars/${model}`}
                className={`flex-shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition whitespace-nowrap ${
                  active === model
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-600 hover:text-blue-600"
                }`}
              >
                {MODEL_LABELS[model]
                  .replace("Toyota ", "")
                  .replace("Mitsubishi ", "")
                  .replace("Nissan ", "")
                  .replace("Mazda ", "")
                  .replace("Honda ", "")
                  .replace("Lexus ", "Lexus ")}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
