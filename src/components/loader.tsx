// The ResolveAI loader: the logo assembles itself (outline traced, square
// filled, check drawn) while a hairline bar sweeps underneath. Pure CSS, so it
// renders from server components such as loading.tsx. Styles: globals.css.

export function Loader({ label = "Loading" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="loader">
      <svg className="loader-mark" width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden>
        <rect className="loader-fill" x="3" y="3" width="42" height="42" rx="10" />
        <rect className="loader-outline" x="3" y="3" width="42" height="42" rx="10" pathLength="100" />
        <path className="loader-check" d="M14 24.8 20.8 31.2 34.4 16.8" pathLength="100" />
      </svg>
      <span className="loader-track" aria-hidden>
        <span className="loader-bar" />
      </span>
      <span className="type-meta">{label}</span>
    </div>
  );
}

// Fills the space a page would take, so the header and footer stay put.
export function PageLoader({ label, className = "" }: { label?: string; className?: string }) {
  return (
    <div className={`flex flex-1 items-center justify-center px-4 py-24 ${className}`}>
      <Loader label={label} />
    </div>
  );
}
