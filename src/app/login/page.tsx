"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { useAuthContext } from "@/features/auth/hooks/auth-context";
import { BrandMark } from "@/components/ui/brand-mark";

const steps = [
  "Pronosticá cada partido antes del pitazo inicial",
  "Sumá puntos por cada acierto del torneo",
  "Escalá en el ranking y competí con otros Globers",
];

const tournamentStats = [
  { value: "48", label: "Selecciones" },
  { value: "104", label: "Partidos" },
  { value: "3", label: "Países sede" },
];

export default function LoginPage() {
  const router = useRouter();
  const { authenticated, error, loading, loginWithGoogleCredential } =
    useAuthContext();

  useEffect(() => {
    if (authenticated) {
      router.replace("/");
    }
  }, [authenticated, router]);

  const handleCredential = useCallback(
    async (idToken: string) => {
      await loginWithGoogleCredential(idToken);
      router.replace("/");
    },
    [loginWithGoogleCredential, router],
  );

  return (
    <main className="login-shell">
      {/* Escena decorativa: estadio nocturno + cancha + balón */}
      <div aria-hidden="true" className="login-scene">
        <div className="login-scene__sky" />
        <div className="login-scene__beams" />
        <div className="login-scene__mesh" />
        <div className="login-scene__pitch" />
        <div className="login-scene__circle" />
        <div className="login-stage">
          <div className="login-stage__cell">
            <div className="login-ball__aura" />
            <div className="login-ball" />
          </div>
        </div>
        <div className="login-scene__scrim" />
      </div>

      <div className="login-frame">
        <header className="login-topbar">
          <BrandMark size="lg" tone="onDark" />
          <span className="login-chip">
            <span aria-hidden="true" className="login-chip__dot" />
            Canadá · México · EE. UU.
          </span>
        </header>

        <div className="flex flex-1 items-center">
          <div className="login-grid">
            {/* Zona 1 — concepto mundialista */}
            <section className="login-grid__intro">
              <p className="login-eyebrow">Una experiencia para Globers</p>

              <h1 className="login-title">
                Viví el <em>Mundial</em> con Globant
              </h1>

              <p className="login-lead">
                Pronosticá, sumá puntos y competí con otros Globers en una polla
                amistosa, simple y transparente.
              </p>
            </section>

            {/* Zona 2 — cómo se juega */}
            <section className="login-grid__detail">
              <ul className="login-steps">
                {steps.map((step, index) => (
                  <li className="login-step" key={step}>
                    <span aria-hidden="true" className="login-step__num">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="login-step__text">{step}</span>
                  </li>
                ))}
              </ul>

              <div className="login-stats">
                {tournamentStats.map((stat) => (
                  <div className="login-stat" key={stat.label}>
                    <span className="login-stat__value">{stat.value}</span>
                    <span className="login-stat__label">{stat.label}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Zona 3 — acceso */}
            <section className="login-grid__card login-card">
              <p className="login-eyebrow">Acceso institucional</p>

              <h2 className="login-card__title">Iniciá sesión</h2>

              <p className="login-card__lead">
                Iniciá sesión para registrar tus pronósticos y competir en el
                ranking.
              </p>

              <div className="login-google-well">
                {loading ? (
                  <p className="login-muted text-center text-sm">
                    Revisando sesión...
                  </p>
                ) : (
                  <GoogleSignInButton
                    disabled={loading}
                    onCredential={handleCredential}
                  />
                )}
              </div>

              {error ? (
                <p className="login-alert" role="alert">
                  {error}
                </p>
              ) : null}

              <p className="login-divider">Acceso seguro</p>

              <p className="login-card__note">
                Usamos tu cuenta de Google únicamente para identificarte dentro
                de la polla.
              </p>
            </section>
          </div>
        </div>

        <footer className="login-footnote">
          <span>Polla Mundialista 2026 · by Globant</span>
          <span className="hidden sm:inline">
            Tu pronóstico. Tu estrategia. Tu Mundial.
          </span>
        </footer>
      </div>
    </main>
  );
}
