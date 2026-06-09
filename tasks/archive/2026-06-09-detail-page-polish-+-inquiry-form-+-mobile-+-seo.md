## Task: Detail Page Polish + Inquiry Form + Mobile + SEO
**Status**: ready
**Assigned to**: codex
**Day**: 5 of 6
**Project root**: /Users/yuyanli/used-car-site

---

## Background

Day 4 delivered a working Next.js site with homepage, model list pages,
and car detail pages — built and 0 errors. Day 5 polishes the experience:
image gallery interaction, inquiry flow, mobile layout, and SEO metadata.

Note: "Total (FOB)" was already corrected to "Total (C&F)" in PriceBox.tsx.
Do NOT change it back.

---

## Objective

1. Image gallery — make it interactive (click thumbnail → swap main image)
2. Inquiry buttons — WhatsApp + Email with pre-filled message
3. Mobile layout — fix any layout issues on 375px screens
4. SEO — add metadata to all pages (title, description, og:image)
5. Polish — loading states, 404 page, small UX improvements

---

## Step 1 — Interactive image gallery

The detail page currently shows images but clicking thumbnails does nothing.
Make the gallery interactive.

Create `website/components/ImageGallery.tsx` as a client component:

```tsx
"use client";

import { useState } from "react";
import Image from "next/image";

interface Props {
  images: string[];
  title: string;
}

export default function ImageGallery({ images, title }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="w-full aspect-[4/3] bg-gray-200 rounded-lg flex items-center justify-center">
        <span className="text-gray-400 text-sm">No image available</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Main image */}
      <div className="relative w-full aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
        <img
          src={images[activeIndex]}
          alt={`${title} - image ${activeIndex + 1}`}
          className="w-full h-full object-cover"
          crossOrigin="anonymous"
        />
        {/* Image counter */}
        {images.length > 1 && (
          <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
            {activeIndex + 1} / {images.length}
          </span>
        )}
      </div>

      {/* Thumbnail strip — only show if more than 1 image */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-colors ${
                i === activeIndex
                  ? "border-blue-500"
                  : "border-transparent hover:border-gray-300"
              }`}
            >
              <img
                src={src}
                alt={`thumbnail ${i + 1}`}
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

Replace the existing image display in `app/car/[id]/page.tsx` with
`<ImageGallery images={car.images} title={car.title_en ?? car.title_ja ?? ""} />`.

---

## Step 2 — Inquiry buttons

On the car detail page, replace the placeholder WhatsApp button with
a proper inquiry section:

```tsx
// Inquiry section — add below PriceBox on detail page

const whatsappNumber = "819000000000"; // placeholder — easy to change
const carTitle = car.title_en ?? car.title_ja ?? car.source_id;
const whatsappText = encodeURIComponent(
  `Hi, I'm interested in this car:\n${carTitle}\nID: ${car.source_id}\nTotal Price: $${car.total_usd?.toLocaleString()}\n\nPlease send more details.`
);
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappText}`;

const emailSubject = encodeURIComponent(`Inquiry: ${carTitle}`);
const emailBody = encodeURIComponent(
  `Hi,\n\nI'm interested in the following car:\n\nTitle: ${carTitle}\nID: ${car.source_id}\nYear: ${car.year}\nMileage: ${car.mileage_km?.toLocaleString()} km\nTotal Price: $${car.total_usd?.toLocaleString()} (C&F)\n\nPlease send more details.\n\nThank you`
);
const emailUrl = `mailto:info@jpusedcars.com?subject=${emailSubject}&body=${emailBody}`;
```

Show two buttons:
- **WhatsApp** — green background, 💬 icon, "Inquire via WhatsApp"
- **Email** — gray/outline, ✉️ icon, "Send Email Inquiry"

Both full-width on mobile, side-by-side on desktop.

---

## Step 3 — SEO metadata

Add metadata exports to each page file.

**app/layout.tsx** — site-wide defaults:
```tsx
export const metadata = {
  title: {
    default: "JP Used Cars — Quality Japanese Used Cars",
    template: "%s | JP Used Cars",
  },
  description:
    "Browse quality used cars sourced directly from Japan. Toyota Prado, Hilux, HiAce and more. Prices include shipping.",
  openGraph: {
    siteName: "JP Used Cars",
    type: "website",
  },
};
```

**app/page.tsx** — homepage:
```tsx
export const metadata = {
  title: "JP Used Cars — Quality Japanese Used Cars",
  description: "Browse Toyota Prado, Hilux, HiAce and more. Updated daily from Japan.",
};
```

**app/cars/[model]/page.tsx** — dynamic:
```tsx
export async function generateMetadata({ params }) {
  const label = MODEL_LABELS[params.model] ?? params.model;
  return {
    title: label,
    description: `Browse used ${label} listings imported from Japan. All prices include shipping.`,
  };
}
```

**app/car/[id]/page.tsx** — dynamic:
```tsx
export async function generateMetadata({ params }) {
  const car = getCarById(params.id);
  if (!car) return { title: "Car Not Found" };
  return {
    title: car.title_en ?? car.title_ja ?? car.source_id,
    description: `${car.year ?? ""} ${car.title_en ?? ""} — $${car.total_usd?.toLocaleString()} C&F. ${car.mileage_km?.toLocaleString() ?? ""} km.`,
    openGraph: {
      images: car.images[0] ? [{ url: car.images[0] }] : [],
    },
  };
}
```

---

## Step 4 — 404 page

Create `app/not-found.tsx`:

```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-gray-200 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">Page Not Found</h2>
      <p className="text-gray-500 mb-8">
        This listing may have been sold or removed.
      </p>
      <Link
        href="/"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Back to Homepage
      </Link>
    </div>
  );
}
```

---

## Step 5 — Mobile polish

Check these specific issues and fix them:

1. **Header nav** — on mobile (< 768px), the model links should collapse
   into a hamburger menu OR scroll horizontally. Pick whichever is simpler.

2. **CarCard** — on mobile, title text should be clamped to 2 lines
   (`line-clamp-2`) to prevent overflow.

3. **Detail page** — on mobile, the 2-column layout (image | info) must
   stack to 1 column with image on top.

4. **PriceBox** — on mobile, the price numbers must not overflow the container.
   Use `text-right` and `min-w-0` to handle long numbers.

5. **Model list grid** — `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`

---

## Step 6 — Small UX improvements

1. **Mileage formatting** — show as "45,000 km" not "45000 km" everywhere
2. **Price formatting** — show as "$21,200" not "$21200" everywhere  
3. **"Updated X days ago"** on homepage — compute from `updated_at` in cars.json
4. **Back button** on detail page — "← Back to Prado listings" linking to `/cars/prado`
5. **"View on Carsensor.net"** button on detail page — opens `car.detail_url` in new tab

---

## Output Files

```
website/components/ImageGallery.tsx   ← NEW (client component)
website/app/not-found.tsx             ← NEW
website/app/layout.tsx                ← UPDATED (site metadata)
website/app/page.tsx                  ← UPDATED (metadata + UX fixes)
website/app/cars/[model]/page.tsx     ← UPDATED (metadata + grid fix)
website/app/car/[id]/page.tsx         ← UPDATED (ImageGallery + inquiry + metadata)
website/components/CarCard.tsx        ← UPDATED (line-clamp, mobile)
website/components/Header.tsx         ← UPDATED (mobile nav)
website/components/PriceBox.tsx       ← UPDATED (mobile overflow fix)
                                         ⚠️ Keep "Total (C&F)" — do NOT change back to FOB
```

---

## Hard Constraints

1. **"Total (C&F)"** — PriceBox already shows C&F, do NOT revert to FOB
2. **ImageGallery must be `"use client"`** — it uses useState
3. **Page files must NOT be `"use client"`** — Server Components only
4. **WhatsApp number as a const** — easy to find and change, not buried in JSX
5. **0 TypeScript errors** — `npm run build` must succeed

---

## Acceptance Criteria

```bash
cd /Users/yuyanli/used-car-site/website

# Must build with 0 errors
npm run build

# Check these routes exist in build output:
# ○ /              (static)
# ● /cars/[model]  (prado, hilux, hiace)
# ● /car/[id]      (90 pages)

# Start dev and manually verify:
npm run dev
```

Manual checks:
- [ ] http://localhost:3000 — homepage loads, shows car count and model cards
- [ ] http://localhost:3000/cars/prado — grid of Prado cards
- [ ] http://localhost:3000/car/AU6956752830 — detail page with working image gallery
- [ ] Click a thumbnail → main image changes
- [ ] WhatsApp button opens correct wa.me link
- [ ] On 375px width (Chrome DevTools) — no horizontal scroll, layout stacks correctly
- [ ] "Total (C&F)" visible on price box (not FOB)
