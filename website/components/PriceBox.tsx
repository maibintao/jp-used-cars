interface PriceBoxProps {
  price_usd: number | null;
  shipping_usd: number;
  total_usd: number | null;
}

function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function PriceBox({
  price_usd,
  shipping_usd,
  total_usd,
}: PriceBoxProps) {
  if (price_usd === null || total_usd === null) {
    return (
      <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-900">Price on Request</p>
        <p className="mt-1 text-xs text-slate-500">
          Contact us for current availability and shipping details.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 text-sm shadow-sm">
      <div className="flex items-center justify-between gap-4 text-slate-700">
        <span>Car Price</span>
        <span className="font-semibold text-slate-950">{formatUsd(price_usd)}</span>
      </div>
      <div className="mt-2 flex items-center justify-between gap-4 text-slate-700">
        <span>+ Shipping</span>
        <span className="font-semibold text-slate-950">
          + {formatUsd(shipping_usd)}
        </span>
      </div>
      <div className="my-3 border-t border-slate-200" />
      <div className="flex items-center justify-between gap-4 text-base font-bold text-emerald-700">
        <span>Total (C&amp;F)</span>
        <span>{formatUsd(total_usd)}</span>
      </div>
    </div>
  );
}
