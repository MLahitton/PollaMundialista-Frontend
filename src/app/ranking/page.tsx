"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthenticatedNav } from "@/components/navigation/authenticated-nav";
import { RankingRow } from "@/components/ranking/ranking-row";
import { LoadingState } from "@/components/ui/loading-state";
import { ApiError } from "@/lib/api/api-client";
import { useAuthContext } from "@/features/auth/hooks/auth-context";
import { getMyTournamentRanking } from "@/features/ranking/api/ranking-api";
import type { TournamentRankingResponse } from "@/features/ranking/types/ranking-types";
import { getActiveTournament } from "@/features/tournaments/api/tournaments-api";
import type { TournamentResponse } from "@/features/tournaments/types/tournament-types";

export default function RankingPage() {
  const router = useRouter();
  const { accessToken, authenticated, loading, logout } = useAuthContext();
  const [tournament, setTournament] = useState<TournamentResponse | null>(null);
  const [ranking, setRanking] = useState<TournamentRankingResponse | null>(
    null,
  );
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !authenticated) {
      router.replace("/login");
    }
  }, [authenticated, loading, router]);

  useEffect(() => {
    if (loading || !authenticated || !accessToken) {
      return;
    }

    async function loadRanking() {
      setPageLoading(true);
      setError(null);

      try {
        const activeTournament = await getActiveTournament();
        setTournament(activeTournament);
        setRanking(
          await getMyTournamentRanking(activeTournament.id, accessToken),
        );
      } catch (loadError) {
        if (loadError instanceof ApiError && loadError.status === 401) {
          logout();
          router.replace("/login");
          return;
        }

        if (loadError instanceof ApiError && loadError.status === 404) {
          setError("No hay un torneo activo disponible.");
          return;
        }

        setError("No fue posible cargar el ranking.");
      } finally {
        setPageLoading(false);
      }
    }

    void loadRanking();
  }, [accessToken, authenticated, loading, logout, router]);

  if (loading || !authenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5">
        <p className="text-sm text-[var(--text-secondary)]">
          Preparando tu sesión...
        </p>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <AuthenticatedNav />
      <section className="app-container">
        <header className="brand-card mb-8 p-8">
          <p className="eyebrow mb-2">
            {tournament?.name ?? "Torneo activo"}
          </p>
          <h1 className="text-4xl font-extrabold text-[var(--globant-dark)]">
            Ranking general
          </h1>
          <p className="mt-3 max-w-2xl text-[var(--text-secondary)]">
            Top 10 del torneo y tu posición actual, respetando exactamente el
            orden y los desempates del backend.
          </p>
          {ranking ? (
            <p className="mt-4 text-sm font-bold text-[var(--globant-dark)]">
              {ranking.rankedParticipants} participantes con puntuación.
            </p>
          ) : null}
        </header>

        {pageLoading ? (
          <LoadingState label="Cargando ranking..." />
        ) : null}

        {error ? (
          <p className="rounded-[var(--radius-sm)] border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </p>
        ) : null}

        {ranking ? (
          <div className="flex flex-col gap-6">
            <section>
              <div className="mb-2 hidden grid-cols-[72px_1fr_90px_90px_120px] px-4 text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)] sm:grid">
                <span>Posición</span>
                <span>Participante</span>
                <span className="text-right">Puntos</span>
                <span className="text-right">Exactos</span>
                <span className="text-right">Outcomes</span>
              </div>
              <div className="grid gap-3">
                {ranking.top10.map((entry) => (
                  <RankingRow entry={entry} key={entry.participantId} />
                ))}
              </div>
            </section>

            <section className="border-t border-[var(--border)] pt-5">
              <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wide text-[var(--globant-dark)]">
                Tu posición
              </h2>
              <RankingRow
                entry={ranking.currentParticipant}
                label="Tu ranking"
              />
            </section>
          </div>
        ) : null}
      </section>
    </main>
  );
}
