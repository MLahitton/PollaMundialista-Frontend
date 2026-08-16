type UserAvatarSize = "sm" | "md" | "lg";

type UserAvatarProps = {
  name: string;
  /** URL que ya viene del backend (profileImageUrl). Puede ser null. */
  imageUrl?: string | null;
  size?: UserAvatarSize;
  /** Aro de acento, para destacar al participante actual. */
  highlighted?: boolean;
};

const sizeClasses: Record<UserAvatarSize, string> = {
  sm: "h-9 w-9 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-base sm:h-16 sm:w-16 sm:text-lg",
};

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function UserAvatar({
  name,
  imageUrl,
  size = "md",
  highlighted = false,
}: UserAvatarProps) {
  const ring = highlighted
    ? "ring-2 ring-[var(--globant-lime)] ring-offset-2 ring-offset-[var(--surface)]"
    : "ring-1 ring-[var(--border)]";
  const base = `${sizeClasses[size]} ${ring} shrink-0 overflow-hidden rounded-full shadow-md`;

  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- avatar remoto de Google, sin dominio fijo
      <img
        alt={`Foto de ${name}`}
        className={`${base} object-cover`}
        referrerPolicy="no-referrer"
        src={imageUrl}
      />
    );
  }

  return (
    <span
      aria-label={`Iniciales de ${name}`}
      className={`${base} flex items-center justify-center bg-[linear-gradient(140deg,rgba(191,215,50,0.32),rgba(56,239,160,0.22))] font-black text-[var(--globant-dark)]`}
      role="img"
    >
      {initialsOf(name)}
    </span>
  );
}
