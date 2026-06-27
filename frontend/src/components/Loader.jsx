export default function Loader({ label = "Loading intelligence..." }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-slate-500">
      <span className="h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
