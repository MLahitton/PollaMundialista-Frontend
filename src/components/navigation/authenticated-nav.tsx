"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthContext } from "@/features/auth/hooks/auth-context";
import { BrandMark } from "@/components/ui/brand-mark";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/matches", label: "Partidos" },
  { href: "/predictions", label: "Mis pronosticos" },
  { href: "/ranking", label: "Ranking" },
  { href: "/scores", label: "Mis puntos" },
];

export function AuthenticatedNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, participant } = useAuthContext();

  return (
    <nav className="sticky top-0 z-20 border-b border-[var(--border)] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <Link href="/">
          <BrandMark />
        </Link>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible md:pb-0">
          {links.map((link) => {
            const active = pathname === link.href;

            return (
              <Link
                className={`shrink-0 rounded-full px-3 py-2 text-sm font-bold ${
                  active
                    ? "bg-[var(--globant-lime)] text-[var(--globant-dark)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--globant-dark)]"
                }`}
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            );
          })}
          </div>
          <div className="flex items-center gap-3">
            {participant ? (
              <span className="hidden max-w-36 truncate text-sm font-semibold text-[var(--text-secondary)] sm:inline">
                {participant.displayName}
              </span>
            ) : null}
          <button
            className="btn-primary px-4 py-2 text-sm"
            onClick={() => {
              logout();
              router.replace("/login");
            }}
            type="button"
          >
            Cerrar sesión
          </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
