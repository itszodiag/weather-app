/** Base card surface used across the dashboard for a consistent look. */
export default function Card({ as: Tag = 'section', className = '', children, ...rest }) {
  return (
    <Tag
      className={`rounded-2xl border border-edge bg-card p-4 shadow-sm transition-colors duration-200 hover:border-accent/30 sm:p-5 ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** Consistent section heading used inside cards. */
export function CardTitle({ children, hint }) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-3">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
        {children}
      </h2>
      {hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </div>
  );
}
