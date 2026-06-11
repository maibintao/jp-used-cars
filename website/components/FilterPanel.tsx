"use client";

import { useState, useCallback } from "react";

export interface Filters {
  yearMin: string;
  yearMax: string;
  priceMin: string;
  priceMax: string;
  mileageMax: string;
}

const EMPTY: Filters = { yearMin: "", yearMax: "", priceMin: "", priceMax: "", mileageMax: "" };

interface FilterPanelProps { onChange: (f: Filters) => void; }

export default function FilterPanel({ onChange }: FilterPanelProps) {
  const [f, setF] = useState<Filters>(EMPTY);
  const [open, setOpen] = useState(true);

  const update = useCallback((key: keyof Filters, val: string) => {
    const next = { ...f, [key]: val };
    setF(next);
    onChange(next);
  }, [f, onChange]);

  const reset = () => { setF(EMPTY); onChange(EMPTY); };
  const hasFilters = Object.values(f).some(Boolean);

  return (
    <div className="rounded-2xl border border-orange-200 bg-white shadow-sm">
      <button onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between px-5 py-4 text-left">
        <span className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <span className="text-orange-500">🔍</span>
          Search & Filter
          {hasFilters && <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs text-white">Active</span>}
        </span>
        <span className={`text-slate-400 transition-transform inline-block ${open ? "rotate-180" : ""}`}>▼</span>
      </button>

      {open && (
        <div className="border-t border-orange-100 px-5 pb-5 pt-4">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-orange-700">Model Year</p>
              <div className="flex items-center gap-2">
                <input type="number" placeholder="From" value={f.yearMin} min={2000} max={2026}
                  onChange={e => update("yearMin", e.target.value)}
                  className="w-full rounded-xl border border-orange-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100" />
                <span className="text-slate-400 font-bold">–</span>
                <input type="number" placeholder="To" value={f.yearMax} min={2000} max={2026}
                  onChange={e => update("yearMax", e.target.value)}
                  className="w-full rounded-xl border border-orange-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100" />
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-orange-700">Total Price USD (C&F)</p>
              <div className="flex items-center gap-2">
                <input type="number" placeholder="Min $" value={f.priceMin} min={0} step={1000}
                  onChange={e => update("priceMin", e.target.value)}
                  className="w-full rounded-xl border border-orange-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100" />
                <span className="text-slate-400 font-bold">–</span>
                <input type="number" placeholder="Max $" value={f.priceMax} min={0} step={1000}
                  onChange={e => update("priceMax", e.target.value)}
                  className="w-full rounded-xl border border-orange-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100" />
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-orange-700">Max Mileage (km)</p>
              <input type="number" placeholder="e.g. 50000" value={f.mileageMax} min={0} step={5000}
                onChange={e => update("mileageMax", e.target.value)}
                className="w-full rounded-xl border border-orange-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100" />
            </div>
          </div>

          {hasFilters && (
            <button onClick={reset} className="mt-4 text-xs font-bold text-orange-600 hover:text-orange-800">
              ✕ Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
