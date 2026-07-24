export default function Loading() {
  return (
    <main className="space-y-6 p-6 md:p-8 animate-pulse">
      <div className="h-56 rounded-3xl bg-slate-200" />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <div className="h-72 rounded-2xl bg-slate-200" />
          <div className="h-52 rounded-2xl bg-slate-200" />
        </div>

        <div className="space-y-6">
          <div className="h-72 rounded-2xl bg-slate-200" />
          <div className="h-56 rounded-2xl bg-slate-200" />
        </div>

        <div className="space-y-6">
          <div className="h-72 rounded-2xl bg-slate-200" />
          <div className="h-56 rounded-2xl bg-slate-200" />
        </div>
      </div>

      <div className="h-96 rounded-2xl bg-slate-200" />
    </main>
  );
}