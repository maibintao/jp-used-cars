import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-4 text-6xl font-bold text-gray-200">404</h1>
      <h2 className="mb-2 text-2xl font-semibold text-gray-800">
        Page Not Found
      </h2>
      <p className="mb-8 text-gray-500">
        This listing may have been sold or removed.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
      >
        Back to Homepage
      </Link>
    </div>
  );
}
