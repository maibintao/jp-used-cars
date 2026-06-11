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
  hilux: "Toyota Hilux",
  landcruiser: "Toyota Land Cruiser",
  prado: "Toyota Land Cruiser Prado",
  hiace: "Toyota HiAce Van",
  harrier: "Toyota Harrier",
  alphard: "Toyota Alphard",
  voxy: "Toyota Voxy",
  rav4: "Toyota RAV4",
  prius: "Toyota Prius",
  xtrail: "Nissan X-Trail",
  noah: "Toyota Noah",
  jimny: "Suzuki Jimny",
  cx5: "Mazda CX-5",
  crown: "Toyota Crown",
  pajero: "Mitsubishi Pajero",
  triton: "Mitsubishi Triton",
  crv: "Honda CR-V",
  lc250: "Toyota Land Cruiser 250",
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
