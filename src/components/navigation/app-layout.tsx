"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthContext } from "@/features/auth/hooks/auth-context";
import { UserAvatar } from "@/components/ui/user-avatar";
import { BrandMark } from "@/components/ui/brand-mark";
import { getUpcomingMatches } from "@/features/matches/api/matches-api";
import { getMyPredictions } from "@/features/predictions/api/predictions-api";
import { getActiveTournament } from "@/features/tournaments/api/tournaments-api";
import { NetworkError } from "@/lib/api/api-client";
import { useConnection } from "@/lib/api/connection-context";

const links = [
  {
    href: "/",
    label: "Inicio",
    icon: (
      <svg className="nav-icon h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect height="7" width="7" rx="1.5" x="3" y="3" />
        <rect height="7" width="7" rx="1.5" x="14" y="3" />
        <rect height="7" width="7" rx="1.5" x="14" y="14" />
        <rect height="7" width="7" rx="1.5" x="3" y="14" />
      </svg>
    ),
  },
  {
    href: "/matches",
    label: "Partidos",
    icon: (
      <svg className="nav-icon h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect height="18" rx="2" width="18" x="3" y="4" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    href: "/predictions",
    label: "Mis pronósticos",
    hasBadge: true,
    icon: (
      <svg className="nav-icon h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
      </svg>
    ),
  },
  {
    href: "/ranking",
    label: "Ranking",
    icon: (
      <svg className="nav-icon h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17M14 14.66V17M8 21h8M6 4h12v7a6 6 0 0 1-12 0V4z" />
      </svg>
    ),
  },
  {
    href: "/scores",
    label: "Mis puntos",
    icon: (
      <svg className="nav-icon h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
];

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { accessToken, logout, participant } = useAuthContext();
  const { reportNetworkError, retryNonce } = useConnection();
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    if (!accessToken) return;
    let isMounted = true;

    async function fetchPending() {
      try {
        const tournament = await getActiveTournament();
        const [matches, predictions] = await Promise.all([
          getUpcomingMatches(tournament.id),
          getMyPredictions(tournament.id, accessToken!),
        ]);
        const predMap = new Map(predictions.map((p) => [p.matchId, p]));
        const pending = matches.filter(
          (m) => m.predictionsOpen && !predMap.has(m.id)
        ).length;
        if (isMounted) setPendingCount(pending);
      } catch (badgeError) {
        // El badge es accesorio, pero si fallo por red hay que avisar al
        // proveedor de conexion para que arranque la reconexion.
        if (badgeError instanceof NetworkError) {
          reportNetworkError();
        }
      }
    }

    void fetchPending();
    return () => {
      isMounted = false;
    };
  }, [accessToken, reportNetworkError, retryNonce]);

  const navLinks = links.map((link) => {
    const active = isActive(pathname, link.href);

    return (
      <Link
        aria-current={active ? "page" : undefined}
        className={`app-nav__link${active ? " app-nav__link--active" : ""}`}
        href={link.href}
        key={link.href}
      >
        {link.icon}
        <span className="flex-1">{link.label}</span>
        {link.hasBadge && pendingCount > 0 ? (
          <span className="rounded-md bg-[var(--sidebar-chip)] px-2 py-0.5 text-xs font-black text-[var(--globant-lime)] border border-[rgba(191,215,50,0.3)]">
            {pendingCount}
          </span>
        ) : null}
      </Link>
    );
  });

  const sessionBlock = (
    <div className="app-header__user">
      {participant ? (
        <div className="flex min-w-0 items-center gap-3">
          <UserAvatar
            highlighted
            imageUrl={participant.profileImageUrl}
            name={participant.displayName}
            size="sm"
          />
          <div className="hidden min-w-0 leading-tight sm:block">
            <p className="truncate text-sm font-bold text-[var(--text-primary)]">
              {participant.displayName}
            </p>
            <p className="truncate text-xs text-[var(--text-faint)]">
              {participant.email}
            </p>
          </div>
        </div>
      ) : null}

      <button
        className="btn-secondary whitespace-nowrap px-4 py-2 text-sm"
        onClick={() => {
          logout();
          router.replace("/login");
        }}
        type="button"
      >
        Cerrar sesión
      </button>
    </div>
  );

  return (
    <main className="app-shell">
      <div className="app-layout">
        {/* Navegación lateral con el logo exacto de Polla Mundialista 2026 by Globant */}
        <aside className="app-sidebar">
          <Link aria-label="Ir al inicio" className="block py-1 px-1 mb-2" href="/">
            <BrandMark tone="onDark" />
          </Link>

          <nav aria-label="Secciones principales" className="app-sidebar__nav mt-3">
            <p className="app-sidebar__label mb-3">PRINCIPAL</p>
            {navLinks}
          </nav>
        </aside>

        <div className="app-main">
          {/* Header Global */}
          <header className="app-header">
            <div className="app-header__inner">
              <Link
                aria-label="Ir al inicio"
                className="app-header__brand flex items-center"
                href="/"
              >
                <BrandMark tone="onLight" />
              </Link>

              {/* Pill de contexto en vivo */}
              <div className="hidden items-center gap-2 rounded-full border border-[rgba(56,239,160,0.3)] bg-[rgba(56,239,160,0.08)] px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-[var(--success)] md:flex">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--globant-lime)]" />
                Mundial 2026 · En vivo
              </div>

              {sessionBlock}
            </div>

            <nav aria-label="Secciones" className="app-nav-mobile">
              {navLinks}
            </nav>
          </header>

          <div className="app-content">{children}</div>
        </div>
      </div>
    </main>
  );
}
