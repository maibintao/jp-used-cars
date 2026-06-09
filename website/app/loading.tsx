export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
        <p className="mt-4 text-sm font-medium text-slate-600">
          Loading listings...
        </p>
      </div>
    </div>
  );
}
