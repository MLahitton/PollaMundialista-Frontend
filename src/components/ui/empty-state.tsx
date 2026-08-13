type EmptyStateProps = {
  title: string;
  description?: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="brand-card-muted p-6">
      <div
        aria-hidden="true"
        className="mb-4 h-2 w-16 rounded-full bg-[var(--globant-lime)]"
      />
      <h2 className="text-lg font-bold text-[var(--globant-dark)]">{title}</h2>
      {description ? (
        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
          {description}
        </p>
      ) : null}
    </div>
  );
}
