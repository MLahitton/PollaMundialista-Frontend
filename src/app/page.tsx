"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/navigation/app-layout";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  ConnectionNotice,
  SessionFallback,
} from "@/components/ui/connection-notice";
import { NetworkError } from "@/lib/api/api-client";
import { useConnection } from "@/lib/api/connection-context";
import { useAuthContext } from "@/features/auth/hooks/auth-context";
import { getActiveTournament } from "@/features/tournaments/api/tournaments-api";
import type { TournamentResponse } from "@/features/tournaments/types/tournament-types";

const quickLinks = [
  {
    href: "/matches",
    eyebrow: "FIXTURE",
    title: "Partidos",
    description: "Consultá el calendario próximo y creá o editá tus pronósticos.",
  },
  {
    href: "/predictions",
    eyebrow: "TUS JUGADAS",
    title: "Mis pronósticos",
    description: "Revisá los marcadores que ya guardaste para el torneo activo.",
  },
  {
    href: "/ranking",
    eyebrow: "COMPETENCIA",
    title: "Ranking",
    description: "Mirá el Top 10 y tu posición actual en la tabla general.",
  },
  {
    href: "/scores",
    eyebrow: "PERFORMANCE",
    title: "Mis puntos",
    description: "Consultá los partidos puntuados y el detalle de tus aciertos.",
  },
];

export default function HomePage() {
  const router = useRouter();
  const { authenticated, hasStoredSession, loading, participant } =
    useAuthContext();
  const { offline, reportNetworkError, reportSuccess, retryNonce } =
    useConnection();
  const [tournament, setTournament] = useState<TournamentResponse | null>(null);

  useEffect(() => {
    if (!loading && !authenticated && !hasStoredSession) {
      router.replace("/login");
    }
  }, [authenticated, hasStoredSession, loading, router]);

  useEffect(() => {
    if (loading || !authenticated) return;
    async function loadData() {
      try {
        const activeTournament = await getActiveTournament();
        setTournament(activeTournament);
        reportSuccess();
      } catch (loadError) {
        if (loadError instanceof NetworkError) {
          reportNetworkError();
        }
        // Otros errores: el dashboard puede vivir sin el nombre del torneo.
      }
    }
    void loadData();
  }, [
    authenticated,
    loading,
    reportNetworkError,
    reportSuccess,
    retryNonce,
  ]);

  if (loading || !participant) {
    return <SessionFallback />;
  }

  return (
    <AppLayout>
      <div className="app-stack app-stack--narrow">
        {offline ? <ConnectionNotice /> : null}

        {/* Tarjeta de Bienvenida Hero (Exacta a la imagen adjunta) */}
        <section className="brand-card relative p-7 sm:p-10">
          {/* Avatar + saludo: una sola unidad visual. El saludo ocupa el
              ancho de la tarjeta (no los 62ch del párrafo), asi el nombre
              entra en una línea y el avatar deja de flotar en el medio. */}
          <div className="flex items-center gap-4 sm:gap-5">
            <UserAvatar
              highlighted
              imageUrl={participant.profileImageUrl}
              name={participant.displayName}
              size="lg"
            />
            <div className="min-w-0">
              <p className="eyebrow">
                {tournament?.name ? tournament.name.toUpperCase() : "POLLA MUNDIALISTA 2026"}
              </p>
              <h1 className="page-title mt-1.5">
                Hola, {participant.displayName}
              </h1>
            </div>
          </div>

          <p className="mt-5 max-w-[62ch] text-base font-normal leading-relaxed text-[var(--text-secondary)]">
            ¿Listo para tu próximo pronóstico? Revisá fixtures, subí posiciones en el ranking y seguí tus puntos durante el Mundial.
          </p>

          {/* Barra acento verde lima inferior */}
          <div className="mt-6 h-1.5 w-16 rounded-full bg-[var(--globant-lime)]" />
        </section>

        {/* Grilla 2x2 de accesos principales (Exacta a la imagen adjunta) */}
        <section className="grid gap-5 sm:grid-cols-2">
          {quickLinks.map((link) => (
            <Link
              className="brand-card brand-card-link flex flex-col justify-between p-7 transition-all duration-200 hover:-translate-y-1 hover:border-[var(--globant-lime)]"
              href={link.href}
              key={link.href}
            >
              <div>
                <p className="eyebrow">{link.eyebrow}</p>
                <h2 className="section-title mt-2">
                  {link.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {link.description}
                </p>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </AppLayout>
  );
}
