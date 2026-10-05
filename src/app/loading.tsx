/** Pantalla de carga inmediata al cambiar de pagina: el clic responde aunque el servidor tarde. */
export default function Loading() {
  return (
    <div className="min-h-screen bg-background" role="status" aria-live="polite">
      <div className="h-1 w-full overflow-hidden bg-brand-soft">
        <div className="h-full w-1/3 animate-pulse rounded-full bg-brand" />
      </div>
      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
        <div className="h-10 w-2/3 max-w-md animate-pulse rounded-full bg-muted" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <div className="aspect-[4/5] animate-pulse rounded-2xl bg-muted" />
              <div className="h-4 w-3/4 animate-pulse rounded-full bg-muted" />
              <div className="h-4 w-1/3 animate-pulse rounded-full bg-muted" />
            </div>
          ))}
        </div>
        <span className="sr-only">Cargando...</span>
      </div>
    </div>
  );
}
