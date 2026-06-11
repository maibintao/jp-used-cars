interface PriceBoxProps {
  price_usd: number | null;
  shipping_usd: number;
  total_usd: number | null;
}

function fmt(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export default function PriceBox({ price_usd, shipping_usd, total_usd }: PriceBoxProps) {
  if (price_usd === null || total_usd === null) {
    return (
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <p className="text-sm font-bold text-blue-800">Price on Request</p>
        <p className="mt-1 text-xs text-slate-500">Contact us for pricing and shipping details.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-blue-100">
      <div className="divide-y divide-blue-100">
        <div className="flex items-center justify-between bg-white px-4 py-3">
          <span className="text-sm text-slate-600">Car Price (FOB Japan)</span>
          <span className="font-semibold text-slate-800">{fmt(price_usd)}</span>
        </div>
        <div className="flex items-center justify-between bg-white px-4 py-3">
          <span className="text-sm text-slate-600">+ Shipping</span>
          <span className="font-semibold text-slate-800">{fmt(shipping_usd)}</span>
        </div>
        <div className="flex items-center justify-between bg-blue-600 px-4 py-4">
          <span className="font-bold text-white">Total (C&amp;F)</span>
          <span className="text-2xl font-extrabold text-white">{fmt(total_usd)}</span>
        </div>
      </div>
    </div>
  );
}
