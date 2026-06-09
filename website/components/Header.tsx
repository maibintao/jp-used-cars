import Link from "next/link";
import { MODEL_LABELS, MODELS, type Model } from "@/lib/cars";

type ActiveNav = "home" | Model | "contact";

interface HeaderProps {
  active?: ActiveNav;
}

function navClass(isActive: boolean): string {
  return [
    "flex-shrink-0 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition",
    isActive
      ? "bg-white text-slate-950"
      : "text-slate-200 hover:bg-slate-800 hover:text-white",
  ].join(" ");
}

export default function Header({ active }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 text-white backdrop-blur">
      <nav className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link href="/" className="text-lg font-bold tracking-tight">
          JP Used Cars
        </Link>
        <div className="-mx-4 flex overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
          <Link href="/" className={navClass(active === "home")}>
            Home
          </Link>
          {MODELS.map((model) => (
            <Link
              key={model}
              href={`/cars/${model}`}
              className={navClass(active === model)}
            >
              {MODEL_LABELS[model].replace("Toyota ", "")}
            </Link>
          ))}
          <a href="mailto:info@jpusedcars.com" className={navClass(active === "contact")}>
            Contact
          </a>
        </div>
      </nav>
    </header>
  );
}
