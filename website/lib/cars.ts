import carsData from "@/public/data/cars.json";

export interface Car {
  source_id: string;
  model: string;
  title_ja: string;
  title_en: string | null;
  year: number | null;
  mileage_km: number | null;
  price_jpy: number | null;
  price_usd: number | null;
  shipping_usd: number;
  total_usd: number | null;
  exchange_rate: number;
  grade_ja: string | null;
  color_ja: string | null;
  color_en: string | null;
  images: string[];
  description_ja: string | null;
  description_en: string | null;
  specs: Record<string, string>;
  specs_en?: Record<string, string | undefined>;
  detail_url: string;
  scraped_at: string;
}

export interface CarsData {
  updated_at: string;
  total: number;
  cars: Car[];
}

export const MODEL_LABELS: Record<string, string> = {
  prado: "Toyota Land Cruiser Prado",
  hilux: "Toyota Hilux",
  hiace: "Toyota HiAce",
  landcruiser: "Toyota Land Cruiser",
  harrier: "Toyota Harrier",
  rav4: "Toyota RAV4",
  crown: "Toyota Crown",
  voxy: "Toyota Voxy",
  noah: "Toyota Noah",
  alphard: "Toyota Alphard",
  lexus_lx: "Lexus LX",
  xtrail: "Nissan X-Trail",
  cx3: "Mazda CX-3",
  cx5: "Mazda CX-5",
  audi_q7: "Audi Q7",
  audi_q8: "Audi Q8",
  pajero: "Mitsubishi Pajero",
  crv: "Honda CR-V",
};

export const MODELS = Object.keys(MODEL_LABELS);

export type Model = string;

export function getAllCars(): Car[] {
  return (carsData as CarsData).cars;
}

export function getCarsByModel(model: string): Car[] {
  return getAllCars().filter((car) => car.model === model);
}

export function getCarById(id: string): Car | undefined {
  return getAllCars().find((car) => car.source_id === id);
}

export function getUpdatedAt(): string {
  return (carsData as CarsData).updated_at;
}

export function isModel(model: string): model is Model {
  return MODELS.includes(model);
}

export function sortNewestFirst(cars: Car[]): Car[] {
  return [...cars].sort(
    (a, b) =>
      new Date(b.scraped_at).getTime() - new Date(a.scraped_at).getTime(),
  );
}
