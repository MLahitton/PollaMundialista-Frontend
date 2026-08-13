"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthenticatedNav } from "@/components/navigation/authenticated-nav";
import { MatchCard } from "@/components/matches/match-card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { ApiError } from "@/lib/api/api-client";
import { useAuthContext } from "@/features/auth/hooks/auth-context";
import { getUpcomingMatches } from "@/features/matches/api/matches-api";
import type { MatchResponse } from "@/features/matches/types/match-types";
import { getMyPredictions } from "@/features/predictions/api/predictions-api";
import type { PredictionResponse } from "@/features/predictions/types/prediction-types";
import { getActiveTournament } from "@/features/tournaments/api/tournaments-api";
import type { TournamentResponse } from "@/features/tournaments/types/tournament-types";

function dateKey(value: string): string {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
  })
    .format(new Date(value))
    .replace(".", "")
    .toUpperCase();
}

export default function MatchesPage() {
  const router = useRouter();
  const { accessToken, authenticated, loading, logout } = useAuthContext();
  const [tournament, setTournament] = useState<TournamentResponse | null>(null);
  const [matches, setMatches] = useState<MatchResponse[]>([]);
  const [predictions, setPredictions] = useState<PredictionResponse[]>([]);
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

    async function loadMatches() {
      setPageLoading(true);
      setError(null);

      try {
        const activeTournament = await getActiveTournament();
        setTournament(activeTournament);

        const [upcomingMatches, myPredictions] = await Promise.all([
          getUpcomingMatches(activeTournament.id),
          getMyPredictions(activeTournament.id, accessToken),
        ]);

        setMatches(upcomingMatches);
        setPredictions(myPredictions);
      } catch (loadError) {
        if (loadError instanceof ApiError && loadError.status === 401) {
          logout();
          router.replace("/login");
          return;
        }

        setError("No fue posible cargar los partidos.");
      } finally {
        setPageLoading(false);
      }
    }

    void loadMatches();
  }, [accessToken, authenticated, loading, logout, router]);

  const predictionsByMatchId = useMemo(() => {
    return new Map(predictions.map((prediction) => [prediction.matchId, prediction]));
  }, [predictions]);

  const matchesByDate = useMemo(() => {
    return matches.reduce<Map<string, MatchResponse[]>>((groups, match) => {
      const key = dateKey(match.startsAt);
      const current = groups.get(key) ?? [];
      groups.set(key, [...current, match]);
      return groups;
    }, new Map());
  }, [matches]);

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
        <header className="mb-8">
          <p className="eyebrow mb-2">
            {tournament?.name ?? "Torneo activo"}
          </p>
          <h1 className="text-4xl font-extrabold text-[var(--globant-dark)]">
            Partidos
          </h1>
          <p className="mt-3 max-w-2xl text-[var(--text-secondary)]">
            El fixture es el centro de la experiencia: revisá horarios,
            estados y tus pronósticos guardados.
          </p>
        </header>

        {pageLoading ? (
          <LoadingState label="Cargando partidos..." />
        ) : null}

        {error ? (
          <p className="rounded-[var(--radius-sm)] border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </p>
        ) : null}

        {!pageLoading && !error && matches.length === 0 ? (
          <EmptyState title="No hay partidos próximos." />
        ) : null}

        <div className="flex flex-col gap-8">
          {Array.from(matchesByDate.entries()).map(([date, dateMatches]) => (
            <section key={date}>
              <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wide text-[var(--globant-dark)]">
                {date}
              </h2>
              <div className="grid gap-3">
                {dateMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    prediction={predictionsByMatchId.get(match.id)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
