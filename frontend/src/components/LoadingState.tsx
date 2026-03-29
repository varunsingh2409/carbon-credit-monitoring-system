function LoadingState({ label = "Loading dashboard..." }: { label?: string }) {
  return (
    <div className="animate-pulse">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="h-4 w-40 rounded-full bg-white/10" />
          <div className="mt-4 h-10 max-w-lg rounded-2xl bg-white/10" />
          <p className="mt-4 text-sm uppercase tracking-[0.24em] text-slate-500">
            {label}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="surface-card overflow-hidden p-6" key={index}>
              <div className="mb-5 h-20 rounded-[1.5rem] bg-gradient-to-r from-white/10 to-transparent" />
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 rounded-full bg-white/10" />
                <div className="h-12 w-12 rounded-2xl bg-white/10" />
              </div>
              <div className="mt-6 h-10 w-28 rounded-2xl bg-white/10" />
              <div className="mt-4 h-4 w-36 rounded-full bg-white/10" />
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-8 xl:grid-cols-[1.35fr_0.95fr]">
          <div className="surface-panel p-6">
            <div className="h-7 w-52 rounded-2xl bg-white/10" />
            <div className="mt-6 space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  className="surface-card p-5"
                  key={index}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="h-6 w-36 rounded-xl bg-white/10" />
                    <div className="h-8 w-24 rounded-full bg-white/10" />
                  </div>
                  <div className="mt-4 h-4 w-44 rounded-full bg-white/10" />
                  <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                    {Array.from({ length: 5 }).map((__, statIndex) => (
                      <div
                        className="rounded-2xl bg-primary/60 p-4"
                        key={`${index}-${statIndex}`}
                      >
                        <div className="h-3 w-16 rounded-full bg-white/10" />
                        <div className="mt-3 h-6 w-20 rounded-xl bg-white/10" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-panel p-6">
            <div className="h-7 w-44 rounded-2xl bg-white/10" />
            <div className="mt-6 space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  className="surface-card p-5"
                  key={index}
                >
                  <div className="flex items-center justify-between">
                    <div className="h-5 w-32 rounded-xl bg-white/10" />
                    <div className="h-7 w-20 rounded-full bg-white/10" />
                  </div>
                  <div className="mt-3 h-4 w-40 rounded-full bg-white/10" />
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="h-16 rounded-2xl bg-primary/60" />
                    <div className="h-16 rounded-2xl bg-primary/60" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoadingState;
