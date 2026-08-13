"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { useAuthContext } from "@/features/auth/hooks/auth-context";
import { BrandMark } from "@/components/ui/brand-mark";

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
    <main className="app-shell flex min-h-screen items-center justify-center px-5 py-10">
      <section className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="brand-card relative overflow-hidden p-8 sm:p-10">
          <div
            aria-hidden="true"
            className="absolute right-8 top-8 h-24 w-24 rounded-full border border-[var(--border)]"
          />
          <BrandMark />
          <div className="mt-16 max-w-xl">
            <p className="eyebrow mb-4">Una experiencia para Globers</p>
            <h1 className="text-4xl font-extrabold leading-tight text-[var(--globant-dark)] sm:text-5xl">
              Viví el Mundial con Globant
            </h1>
            <p className="mt-5 text-lg leading-8 text-[var(--text-secondary)]">
              Pronosticá, sumá puntos y competí con otros Globers en una polla
              amistosa, simple y transparente.
            </p>
          </div>
          <div className="mt-12 flex gap-3">
            <span className="h-2 w-20 rounded-full bg-[var(--globant-lime)]" />
            <span className="h-2 w-10 rounded-full bg-[var(--globant-mint)]" />
          </div>
        </div>

        <div className="brand-card flex flex-col justify-center p-8 sm:p-10">
          <p className="eyebrow mb-3">
            Acceso institucional
          </p>
          <h2 className="text-3xl font-bold text-[var(--globant-dark)]">
            Polla Mundialista 2026
          </h2>
          <p className="mt-4 text-base leading-7 text-[var(--text-secondary)]">
            Iniciá sesión para registrar tus pronósticos y competir en el
            ranking.
          </p>

        <div className="mt-8 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-muted)] p-5">
          {loading ? (
            <p className="text-center text-sm text-[var(--text-secondary)]">
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
          <p className="mt-5 rounded-[var(--radius-sm)] border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </p>
        ) : null}
        </div>
      </section>
    </main>
  );
}
