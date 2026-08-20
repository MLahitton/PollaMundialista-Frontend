"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/navigation/app-layout";
import { MatchCard } from "@/components/matches/match-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingState } from "@/components/ui/loading-state";
import {
  ConnectionNotice,
  SessionFallback,
} from "@/components/ui/connection-notice";
import { ApiError, NetworkError } from "@/lib/api/api-client";
import { useConnection } from "@/lib/api/connection-context";
import { useAuthContext } from "@/features/auth/hooks/auth-context";
import { getUpcomingMatches } from "@/features/matches/api/matches-api";
import type { MatchResponse } from "@/features/matches/types/match-types";
import { getMyPredictions } from "@/features/predictions/api/predictions-api";
import type { PredictionResponse } from "@/features/predictions/types/prediction-types";
import { StageHeader } from "@/components/matches/stage-header";
import { getStagesByTournament } from "@/features/stages/api/stages-api";
import type {
  StageResponse,
  StageTypeValue,
} from "@/features/stages/types/stage-types";
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

function groupByDate(stageMatches: MatchResponse[]): Map<string, MatchResponse[]> {
  return stageMatches.reduce<Map<string, MatchResponse[]>>((groups, match) => {
    const key = dateKey(match.startsAt);
    const current = groups.get(key) ?? [];
    groups.set(key, [...current, match]);
    return groups;
  }, new Map());
}

export default function MatchesPage() {
  const router = useRouter();
  const { accessToken, authenticated, hasStoredSession, loading, logout } =
    useAuthContext();
  const { offline, reportNetworkError, reportSuccess, retryNonce } =
    useConnection();
  const [tournament, setTournament] = useState<TournamentResponse | null>(null);
  const [matches, setMatches] = useState<MatchResponse[]>([]);
  const [stages, setStages] = useState<StageResponse[]>([]);
  const [predictions, setPredictions] = useState<PredictionResponse[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Solo salir a /login si realmente no hay sesion: si el backend esta
    // caido conservamos el token y esperamos a que vuelva.
    if (!loading && !authenticated && !hasStoredSession) {
      router.replace("/login");
    }
  }, [authenticated, hasStoredSession, loading, router]);

  useEffect(() => {
    if (loading || !authenticated || !accessToken) {
      return;
    }

    const token = accessToken;

    async function loadMatches() {
      setPageLoading(true);
      setError(null);

      try {
        const activeTournament = await getActiveTournament();
        setTournament(activeTournament);

        const [upcomingMatches, tournamentStages, myPredictions] =
          await Promise.all([
            getUpcomingMatches(activeTournament.id),
            getStagesByTournament(activeTournament.id),
            getMyPredictions(activeTournament.id, token),
          ]);

        setMatches(upcomingMatches);
        setStages(tournamentStages);
        setPredictions(myPredictions);
        reportSuccess();
      } catch (loadError) {
        // Backend caido: conservar los datos ya mostrados y dejar que el
        // proveedor de conexion reintente. No es un error de la pagina.
        if (loadError instanceof NetworkError) {
          reportNetworkError();
          return;
        }

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

  const predictionsByMatchId = useMemo(() => {
    return new Map(predictions.map((prediction) => [prediction.matchId, prediction]));
  }, [predictions]);

  // El recorrido del torneo lo define el backend: agrupamos por stageId y
  // respetamos su orderNumber. No se infiere ninguna fase desde el frontend.
  const stageSections = useMemo(() => {
    const orderedStages = [...stages].sort(
      (first, second) => first.orderNumber - second.orderNumber,
    );
    const knownStageIds = new Set(orderedStages.map((stage) => stage.id));
    const matchesByStageId = new Map<string, MatchResponse[]>();
    const withoutStage: MatchResponse[] = [];

    for (const match of matches) {
      if (!knownStageIds.has(match.stageId)) {
        withoutStage.push(match);
        continue;
      }

      const current = matchesByStageId.get(match.stageId) ?? [];
      matchesByStageId.set(match.stageId, [...current, match]);
    }

    const sections = orderedStages
      .map((stage) => ({
        key: stage.id,
        name: stage.name,
        type: stage.type,
        stageMatches: matchesByStageId.get(stage.id) ?? [],
      }))
      .filter((section) => section.stageMatches.length > 0);

    // Red de seguridad: si el backend agrega una etapa que todavia no
    // conocemos, sus partidos se muestran igual en vez de desaparecer.
    if (withoutStage.length > 0) {
      sections.push({
        key: "sin-etapa",
        name: "Otros partidos",
        type: "OTHER" as StageTypeValue,
        stageMatches: withoutStage,
      });
    }

    return sections;
  }, [matches, stages]);

  if (loading || !authenticated) {
    return <SessionFallback />;
  }

  const pendingCount = matches.filter(
    (match) => match.predictionsOpen && !predictionsByMatchId.has(match.id),
  ).length;

  return (
    <AppLayout>
      <div className="app-stack">
        <PageHeader
          aside={
            !pageLoading && matches.length > 0 ? (
              <div className="flex gap-3">
                <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-muted)] px-5 py-4 text-center">
                  <p className="text-2xl font-black leading-none text-[var(--text-primary)]">
                    {matches.length}
                  </p>
                  <p className="mt-2 label-caps">
                    Próximos
                  </p>
                </div>
                <div className="rounded-[var(--radius-md)] border border-[rgba(191,215,50,0.35)] bg-[rgba(191,215,50,0.12)] px-5 py-4 text-center">
                  <p className="text-2xl font-black leading-none text-[var(--accent-ink)]">
                    {pendingCount}
                  </p>
                  <p className="mt-2 label-caps">
                    Sin pronóstico
                  </p>
                </div>
              </div>
            ) : null
          }
          description="El fixture es el centro de la experiencia: revisá horarios, estados y tus pronósticos guardados."
          eyebrow={tournament?.name ?? "Torneo activo"}
          title="Partidos"
        />

        {pageLoading ? <LoadingState label="Cargando partidos..." /> : null}

        {offline ? <ConnectionNotice /> : null}

        {error && !offline ? <p className="app-alert">{error}</p> : null}

        {/* El estado vacio solo aplica si el backend respondio 200 con []. */}
        {!pageLoading && !error && !offline && matches.length === 0 ? (
          <EmptyState
            description="Cuando el calendario del torneo esté publicado vas a poder cargar tus pronósticos desde acá."
            title="No hay partidos próximos"
          />
        ) : null}

        <div className="flex flex-col gap-10 sm:gap-12">
          {stageSections.map((section, index) => (
            <section key={section.key}>
              <StageHeader
                fallbackName={section.name}
                matchCount={section.stageMatches.length}
                position={index + 1}
                total={stageSections.length}
                type={section.type}
              />

              <div className="flex flex-col gap-6">
                {Array.from(groupByDate(section.stageMatches).entries()).map(
                  ([date, dateMatches]) => (
                    <div key={date}>
                      <h3 className="label-caps mb-3">{date}</h3>
                      <div className="grid gap-4 xl:grid-cols-2">
                        {dateMatches.map((match) => (
                          <MatchCard
                            key={match.id}
                            match={match}
                            prediction={predictionsByMatchId.get(match.id)}
                          />
                        ))}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
