"use client";

import { useState, useCallback } from "react";

export interface Filters {
  yearMin: string;
  yearMax: string;
  priceMin: string;
  priceMax: string;
  mileageMax: string;
}

interface FilterPanelProps {
  onChange: (f: Filters) => void;
}

const EMPTY: Filters = {
  yearMin: "",
  yearMax: "",
  priceMin: "",
  priceMax: "",
  mileageMax: "",
};

export default function FilterPanel({ onChange }: FilterPanelProps) {
  const [f, setF] = useState<Filters>(EMPTY);
  const [open, setOpen] = useState(true);

  const update = useCallback(
    (key: keyof Filters, val: string) => {
      const next = { ...f, [key]: val };
      setF(next);
      onChange(next);
    },
    [f, onChange],
  );

  const reset = () => {
    setF(EMPTY);
    onChange(EMPTY);
  };

  const hasFilters = Object.values(f).some(Boolean);

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          Filter
          {hasFilters && (
            <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">Active</span>
          )}
        </span>
        <svg className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-slate-100 px-5 pb-5 pt-4">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {/* Year */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Year</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="From"
                  value={f.yearMin}
                  min={2000}
                  max={2026}
                  onChange={(e) => update("yearMin", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                <span className="text-slate-400">–</span>
                <input
                  type="number"
                  placeholder="To"
                  value={f.yearMax}
                  min={2000}
                  max={2026}
                  onChange={(e) => update("yearMax", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Price */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Total Price (USD C&F)</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min $"
                  value={f.priceMin}
                  min={0}
                  step={1000}
                  onChange={(e) => update("priceMin", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                <span className="text-slate-400">–</span>
                <input
                  type="number"
                  placeholder="Max $"
                  value={f.priceMax}
                  min={0}
                  step={1000}
                  onChange={(e) => update("priceMax", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Mileage */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Max Mileage (km)</p>
              <input
                type="number"
                placeholder="e.g. 50000"
                value={f.mileageMax}
                min={0}
                step={5000}
                onChange={(e) => update("mileageMax", e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {hasFilters && (
            <button
              onClick={reset}
              className="mt-4 text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              ✕ Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
