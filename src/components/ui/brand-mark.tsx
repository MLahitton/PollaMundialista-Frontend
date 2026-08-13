import Image from "next/image";

type BrandMarkProps = {
  useAsset?: boolean;
};

export function BrandMark({ useAsset = false }: BrandMarkProps) {
  return (
    <div className="flex items-center gap-3">
      {useAsset ? (
        <Image
          alt=""
          height={32}
          priority
          src="/brand/globant-arrow.png"
          width={32}
        />
      ) : (
        <span
          aria-hidden="true"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--globant-lime)] text-sm font-black text-[var(--globant-dark)]"
        >
          G
        </span>
      )}
      <div className="leading-tight">
        <p className="text-sm font-extrabold text-[var(--globant-dark)]">
          Polla Mundialista 2026
        </p>
        <p className="text-xs font-medium text-[var(--text-secondary)]">
          by Globant
        </p>
      </div>
    </div>
  );
}
