type LoadingStateProps = {
  label: string;
};

export function LoadingState({ label }: LoadingStateProps) {
  return (
    <div className="brand-card-muted p-5 text-sm font-semibold text-[var(--text-secondary)]">
      {label}
    </div>
  );
}
