"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthenticatedNav } from "@/components/navigation/authenticated-nav";
import { PredictionForm } from "@/components/predictions/prediction-form";
import { PublicPredictionCard } from "@/components/predictions/public-prediction-card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { StatusBadge, statusLabel } from "@/components/ui/status-badge";
import { ApiError } from "@/lib/api/api-client";
import { useAuthContext } from "@/features/auth/hooks/auth-context";
import { getMatch } from "@/features/matches/api/matches-api";
import type { MatchResponse } from "@/features/matches/types/match-types";
import {
  getMyPredictionByMatch,
  upsertMyPrediction,
} from "@/features/predictions/api/predictions-api";
import type {
  PredictionResponse,
  UpsertPredictionRequest,
} from "@/features/predictions/types/prediction-types";
import { getPublicPredictionsByMatch } from "@/features/public-predictions/api/public-predictions-api";
import type { PublicPredictionResponse } from "@/features/public-predictions/types/public-prediction-types";

type MatchDetailPageProps = {
  params: Promise<{ matchId: string }>;
};

function teamName(name: string | null, code: string | null): string {
  return name ?? code ?? "Por definir";
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function qualifiedTeamName(match: MatchResponse): string | null {
  if (!match.qualifiedTeamId) {
    return null;
  }

  if (match.qualifiedTeamId === match.homeTeamId) {
    return teamName(match.homeTeamName, match.homeTeamCode);
  }

  if (match.qualifiedTeamId === match.awayTeamId) {
    return teamName(match.awayTeamName, match.awayTeamCode);
  }

  return null;
}

export default function MatchDetailPage({ params }: MatchDetailPageProps) {
  const { matchId } = use(params);
  const router = useRouter();
  const { accessToken, authenticated, loading, logout, participant } =
    useAuthContext();
  const [match, setMatch] = useState<MatchResponse | null>(null);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [publicPredictions, setPublicPredictions] = useState<
    PublicPredictionResponse[]
  >([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [publicPredictionsLoading, setPublicPredictionsLoading] =
    useState(false);
  const [publicPredictionsError, setPublicPredictionsError] = useState<
    string | null
  >(null);

  const handleExpiredSession = useCallback(() => {
    logout();
    router.replace("/login");
  }, [logout, router]);

  const loadPublicPredictions = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    setPublicPredictionsLoading(true);
    setPublicPredictionsError(null);

    try {
      setPublicPredictions(
        await getPublicPredictionsByMatch(matchId, accessToken),
      );
    } catch (loadError) {
      if (loadError instanceof ApiError && loadError.status === 401) {
        handleExpiredSession();
        return;
      }

      setPublicPredictionsError(
        "No fue posible cargar los pronosticos del partido.",
      );
    } finally {
      setPublicPredictionsLoading(false);
    }
  }, [accessToken, handleExpiredSession, matchId]);

  useEffect(() => {
    if (!loading && !authenticated) {
      router.replace("/login");
    }
  }, [authenticated, loading, router]);

  useEffect(() => {
    if (loading || !authenticated || !accessToken) {
      return;
    }

    async function loadMatch() {
      setPageLoading(true);
      setError(null);

      try {
        const [matchResponse, predictionResponse] = await Promise.all([
          getMatch(matchId),
          getMyPredictionByMatch(matchId, accessToken),
        ]);

        setMatch(matchResponse);
        setPrediction(predictionResponse);
        await loadPublicPredictions();
      } catch (loadError) {
        if (loadError instanceof ApiError && loadError.status === 401) {
          handleExpiredSession();
          return;
        }

        setError("No fue posible cargar el partido.");
      } finally {
        setPageLoading(false);
      }
    }

    void loadMatch();
  }, [
    accessToken,
    authenticated,
    handleExpiredSession,
    loadPublicPredictions,
    loading,
    matchId,
  ]);

  async function handleSubmit(request: UpsertPredictionRequest) {
    if (!accessToken || !match) {
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const savedPrediction = await upsertMyPrediction(
        match.id,
        request,
        accessToken,
      );
      setPrediction(savedPrediction);
      await loadPublicPredictions();
      setMessage("Pronostico guardado.");
    } catch (saveError) {
      if (saveError instanceof ApiError && saveError.status === 401) {
        handleExpiredSession();
        return;
      }

      if (saveError instanceof ApiError && saveError.status === 409) {
        setError("Este pronostico ya esta cerrado.");
        setMatch(await getMatch(match.id));
        return;
      }

      if (saveError instanceof ApiError && saveError.status === 400) {
        setError("Revisa el marcador y el equipo clasificado seleccionado.");
        return;
      }

      setError("No fue posible guardar el pronostico.");
    } finally {
      setSaving(false);
    }
  }

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
      <section className="app-container max-w-4xl">
        <Link
          className="text-sm font-bold text-[var(--globant-dark)] underline"
          href="/matches"
        >
          Volver a partidos
        </Link>

        {pageLoading ? (
          <div className="mt-6">
            <LoadingState label="Cargando partido..." />
          </div>
        ) : null}

        {match ? (
          <>
            <header className="brand-card my-6 p-8">
              <p className="eyebrow mb-2">
                {formatDateTime(match.startsAt)}
              </p>
              <h1 className="text-4xl font-extrabold leading-tight text-[var(--globant-dark)]">
                {teamName(match.homeTeamName, match.homeTeamCode)} vs{" "}
                {teamName(match.awayTeamName, match.awayTeamCode)}
              </h1>
              <p className="mt-3 text-sm text-[var(--text-secondary)]">
                Cierre de pronóstico: {formatDateTime(match.predictionClosesAt)}
              </p>
            </header>

            <section className="brand-card mb-6 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="eyebrow mb-2">
                    Estado
                  </p>
                  <StatusBadge status={match.status} />
                  <p className="mt-2 text-sm font-semibold text-[var(--text-secondary)]">
                    {statusLabel(match.status)}
                  </p>
                </div>

                {match.resultVisible &&
                match.homeScore !== null &&
                match.awayScore !== null ? (
                  <div className="sm:text-right">
                    <p className="eyebrow">
                      Resultado
                    </p>
                    <p className="mt-1 text-3xl font-extrabold text-[var(--globant-dark)]">
                      {teamName(match.homeTeamName, match.homeTeamCode)}{" "}
                      {match.homeScore} - {match.awayScore}{" "}
                      {teamName(match.awayTeamName, match.awayTeamCode)}
                    </p>
                    {match.homePenaltyScore !== null &&
                    match.awayPenaltyScore !== null ? (
                      <p className="mt-2 text-sm font-bold text-[var(--text-secondary)]">
                        Penales: {match.homePenaltyScore} -{" "}
                        {match.awayPenaltyScore}
                      </p>
                    ) : null}
                    {qualifiedTeamName(match) ? (
                      <p className="mt-2 text-sm font-bold text-[var(--success)]">
                        Clasifica: {qualifiedTeamName(match)}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-extrabold text-[var(--globant-dark)]">
                Mi pronóstico
              </h2>
              {match.predictionsOpen ? (
                <PredictionForm
                  match={match}
                  onSubmit={handleSubmit}
                  prediction={prediction}
                  saving={saving}
                />
              ) : (
                <div className="brand-card p-5">
                  <p className="text-sm font-bold text-[var(--text-secondary)]">
                    La ventana de pronósticos ya cerró.
                  </p>
                  {prediction ? (
                    <p className="mt-3 text-3xl font-extrabold text-[var(--globant-dark)]">
                      {prediction.predictedHomeScore} -{" "}
                      {prediction.predictedAwayScore}
                    </p>
                  ) : (
                    <p className="mt-3 text-sm text-[var(--text-secondary)]">
                      No registraste pronóstico para este partido.
                    </p>
                  )}
                </div>
              )}
            </section>

            <section className="mt-8 border-t border-[var(--border)] pt-6">
              <div className="mb-4">
                <h2 className="text-2xl font-extrabold text-[var(--globant-dark)]">
                  Pronósticos de participantes
                </h2>
                {match.predictionsOpen ? (
                  <p className="mt-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-sm leading-6 text-[var(--text-secondary)]">
                    Los pronósticos de los demás se revelarán cuando cierre la
                    ventana.
                  </p>
                ) : null}
              </div>

              {publicPredictionsLoading ? (
                <LoadingState label="Cargando pronósticos..." />
              ) : null}

              {publicPredictionsError ? (
                <p className="rounded-[var(--radius-sm)] border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  {publicPredictionsError}
                </p>
              ) : null}

              {!publicPredictionsLoading &&
              !publicPredictionsError &&
              publicPredictions.length === 0 ? (
                <EmptyState title="Todavía no hay pronósticos registrados para este partido." />
              ) : null}

              {participant ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {publicPredictions.map((publicPrediction) => (
                    <PublicPredictionCard
                      currentParticipantId={participant.id}
                      key={publicPrediction.predictionId}
                      match={match}
                      prediction={publicPrediction}
                    />
                  ))}
                </div>
              ) : null}
            </section>
          </>
        ) : null}

        {message ? (
          <p className="mt-5 rounded-[var(--radius-sm)] border border-[var(--globant-lime)] bg-[rgb(191_215_50_/_16%)] p-3 text-sm font-bold text-[var(--globant-dark)]">
            {message}
          </p>
        ) : null}

        {error ? (
          <p className="mt-5 rounded-[var(--radius-sm)] border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </p>
        ) : null}
      </section>
    </main>
  );
}
