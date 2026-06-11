"use client";

import { useState, useCallback, useMemo } from "react";
import CarCard from "@/components/CarCard";
import FilterPanel, { type Filters } from "@/components/FilterPanel";
import type { Car } from "@/lib/cars";

interface CarGridProps {
  cars: Car[];
  modelLabel?: string;
}

export default function CarGrid({ cars }: CarGridProps) {
  const [filters, setFilters] = useState<Filters>({
    yearMin: "", yearMax: "", priceMin: "", priceMax: "", mileageMax: "",
  });

  const handleFilter = useCallback((f: Filters) => setFilters(f), []);

  const filtered = useMemo(() => {
    return cars.filter((car) => {
      if (filters.yearMin && (car.year ?? 0) < Number(filters.yearMin)) return false;
      if (filters.yearMax && (car.year ?? 9999) > Number(filters.yearMax)) return false;
      if (filters.priceMin && (car.total_usd ?? 0) < Number(filters.priceMin)) return false;
      if (filters.priceMax && (car.total_usd ?? 0) > Number(filters.priceMax)) return false;
      if (filters.mileageMax && (car.mileage_km ?? 0) > Number(filters.mileageMax)) return false;
      return true;
    });
  }, [cars, filters]);

  return (
    <>
      <FilterPanel onChange={handleFilter} />

      <div className="mt-2 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {filtered.length === cars.length
            ? `${cars.length} listings`
            : `${filtered.length} of ${cars.length} listings`}
        </p>
      </div>

      {filtered.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((car) => (
            <CarCard key={car.source_id} car={car} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-lg font-bold text-slate-700">No matching vehicles</p>
          <p className="mt-1 text-sm text-slate-500">Try adjusting your filters.</p>
        </div>
      )}
    </>
  );
}
