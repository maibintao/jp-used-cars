import type { Metadata } from "next";
import localFont from "next/font/local";
import { getAllCars } from "@/lib/cars";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const defaultOgImage = getAllCars().find((car) => car.images[0])?.images[0];

export const metadata: Metadata = {
  title: {
    default: "JP Used Cars — Quality Japanese Used Cars",
    template: "%s | JP Used Cars",
  },
  description:
    "Browse quality used cars sourced directly from Japan. Toyota Prado, Hilux, HiAce and more. Prices include shipping.",
  openGraph: {
    siteName: "JP Used Cars",
    type: "website",
    images: defaultOgImage ? [{ url: defaultOgImage }] : [],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
