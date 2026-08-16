"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/navigation/app-layout";
import { RankingRow } from "@/components/ranking/ranking-row";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageHeader } from "@/components/ui/page-header";
import {
  ConnectionNotice,
  SessionFallback,
} from "@/components/ui/connection-notice";
import { ApiError, NetworkError } from "@/lib/api/api-client";
import { useConnection } from "@/lib/api/connection-context";
import { useAuthContext } from "@/features/auth/hooks/auth-context";
import { getMyTournamentRanking } from "@/features/ranking/api/ranking-api";
import type { TournamentRankingResponse } from "@/features/ranking/types/ranking-types";
import { getActiveTournament } from "@/features/tournaments/api/tournaments-api";
import type { TournamentResponse } from "@/features/tournaments/types/tournament-types";

export default function RankingPage() {
  const router = useRouter();
  const { accessToken, authenticated, hasStoredSession, loading, logout } =
    useAuthContext();
  const { offline, reportNetworkError, reportSuccess, retryNonce } =
    useConnection();
  const [tournament, setTournament] = useState<TournamentResponse | null>(null);
  const [ranking, setRanking] = useState<TournamentRankingResponse | null>(
    null,
  );
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !authenticated && !hasStoredSession) {
      router.replace("/login");
    }
  }, [authenticated, hasStoredSession, loading, router]);

  useEffect(() => {
    if (loading || !authenticated || !accessToken) {
      return;
    }

    const token = accessToken;

    async function loadRanking() {
      setPageLoading(true);
      setError(null);

      try {
        const activeTournament = await getActiveTournament();
        setTournament(activeTournament);
        setRanking(
          await getMyTournamentRanking(activeTournament.id, token),
        );
        reportSuccess();
      } catch (loadError) {
        if (loadError instanceof NetworkError) {
          reportNetworkError();
          return;
        }

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
  }, [
    accessToken,
    authenticated,
    loading,
    logout,
    reportNetworkError,
    reportSuccess,
    retryNonce,
    router,
  ]);

  if (loading || !authenticated) {
    return <SessionFallback />;
  }

  const me = ranking?.currentParticipant;

  return (
    <AppLayout>
      <div className="app-stack">
        <PageHeader
          aside={
            me ? (
              <div className="brand-card brand-card-accent flex items-center gap-5 px-6 py-5">
                <div className="text-center">
                  <p className="text-[clamp(2rem,1.6rem+1vw,2.8rem)] font-black leading-none text-[var(--accent-ink)]">
                    #{me.position}
                  </p>
                  <p className="mt-2 label-caps">
                    Tu posición
                  </p>
                </div>
                <span
                  aria-hidden="true"
                  className="h-12 w-px bg-[var(--border)]"
                />
                <div className="text-center">
                  <p className="text-[clamp(2rem,1.6rem+1vw,2.8rem)] font-black leading-none text-[var(--text-primary)]">
                    {me.totalPoints}
                  </p>
                  <p className="mt-2 label-caps">
                    Puntos
                  </p>
                </div>
              </div>
            ) : null
          }
          description="Top 10 del torneo y tu posición actual, respetando exactamente el orden y los desempates del backend."
          eyebrow={tournament?.name ?? "Torneo activo"}
          title="Ranking general"
        />

        {pageLoading ? <LoadingState label="Cargando ranking..." rows={5} /> : null}

        {offline ? <ConnectionNotice /> : null}

        {error && !offline ? <p className="app-alert">{error}</p> : null}

        {ranking ? (
          <div className="flex flex-col gap-10">
            <section>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="section-title">Top 10</h2>
                <span className="tag tag-lime">
                  {ranking.rankedParticipants} participantes con puntuación
                </span>
              </div>
              {ranking.top10.length === 0 ? (
                <EmptyState
                  description="En cuanto se puntúe el primer partido vas a ver acá la tabla del torneo."
                  title="El ranking todavía no tiene participantes"
                />
              ) : (
                <div className="grid gap-3">
                  {ranking.top10.map((entry) => (
                    <RankingRow entry={entry} key={entry.participantId} />
                  ))}
                </div>
              )}
            </section>

            {me ? (
              <section>
                <h2 className="section-title mb-4">Tu posición</h2>
                <RankingRow entry={me} label="Tu ranking" />
              </section>
            ) : null}
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
}
