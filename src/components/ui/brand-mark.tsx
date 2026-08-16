import Image from "next/image";

type BrandMarkProps = {
  useAsset?: boolean;
  /** Fondo sobre el que se apoya la marca. Solo afecta colores. */
  tone?: "onLight" | "onDark";
  /** "lg" escala la marca en pantallas grandes. Solo afecta tamaños. */
  size?: "md" | "lg";
};

export function BrandMark({
  useAsset = false,
  tone = "onLight",
  size = "md",
}: BrandMarkProps) {
  const onDark = tone === "onDark";
  const lg = size === "lg";

  const badge = lg
    ? "h-9 w-9 text-base lg:h-12 lg:w-12 lg:text-xl"
    : "h-8 w-8 text-sm";
  const title = lg ? "text-base lg:text-xl" : "text-sm";
  const subtitle = lg ? "text-xs lg:text-sm" : "text-xs";

  return (
    <div className={lg ? "flex items-center gap-3 lg:gap-4" : "flex items-center gap-3"}>
      {useAsset ? (
        <Image
          alt=""
          height={lg ? 48 : 32}
          priority
          src="/brand/globant-arrow.png"
          width={lg ? 48 : 32}
        />
      ) : (
        <span
          aria-hidden="true"
          className={`flex items-center justify-center rounded-full bg-[var(--globant-lime)] font-black text-[var(--globant-dark)] ${badge}${
            onDark ? " shadow-[0_0_22px_rgba(191,215,50,0.45)]" : ""
          }`}
        >
          G
        </span>
      )}
      <div className="leading-tight">
        <p
          className={`${title} font-extrabold ${
            onDark ? "text-white" : "text-[var(--text-primary)]"
          }`}
        >
          Polla Mundialista 2026
        </p>
        <p
          className={`${subtitle} font-medium ${
            onDark ? "text-[rgba(223,240,235,0.6)]" : "text-[var(--text-secondary)]"
          }`}
        >
          by Globant
        </p>
      </div>
    </div>
  );
}
