"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthenticatedNav } from "@/components/navigation/authenticated-nav";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuthContext } from "@/features/auth/hooks/auth-context";

const quickLinks = [
  {
    href: "/matches",
    eyebrow: "Fixture",
    title: "Partidos",
    description: "Consultá el calendario próximo y creá o editá tus pronósticos.",
  },
  {
    href: "/predictions",
    eyebrow: "Tus jugadas",
    title: "Mis pronósticos",
    description: "Revisá los marcadores que ya guardaste para el torneo activo.",
  },
  {
    href: "/ranking",
    eyebrow: "Competencia",
    title: "Ranking",
    description: "Mirá el Top 10 y tu posición actual en la tabla general.",
  },
  {
    href: "/scores",
    eyebrow: "Performance",
    title: "Mis puntos",
    description: "Consultá los partidos puntuados y el detalle de tus aciertos.",
  },
];

export default function HomePage() {
  const router = useRouter();
  const { authenticated, loading, participant } = useAuthContext();

  useEffect(() => {
    if (!loading && !authenticated) {
      router.replace("/login");
    }
  }, [authenticated, loading, router]);

  if (loading || !participant) {
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
      <section className="app-container flex flex-col gap-8">
        <header className="brand-card relative overflow-hidden p-8 sm:p-10">
          <div
            aria-hidden="true"
            className="absolute right-8 top-8 hidden h-28 w-28 rounded-full border border-[var(--border)] sm:block"
          />
          <p className="eyebrow mb-4">Polla Mundialista 2026</p>
          <h1 className="max-w-2xl text-4xl font-extrabold leading-tight text-[var(--globant-dark)]">
            Hola, {participant.displayName}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--text-secondary)]">
            ¿Listo para tu próximo pronóstico? Revisá fixtures, subí posiciones
            en el ranking y seguí tus puntos durante el Mundial.
          </p>
          <div className="mt-8 h-2 w-28 rounded-full bg-[var(--globant-lime)]" />
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          {quickLinks.map((link) => (
            <Link
              className="brand-card p-6 hover:-translate-y-0.5 hover:border-[var(--globant-dark)]"
              href={link.href}
              key={link.href}
            >
              <p className="eyebrow mb-3">{link.eyebrow}</p>
              <h2 className="text-2xl font-bold text-[var(--globant-dark)]">
                {link.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                {link.description}
              </p>
            </Link>
          ))}
        </div>

        <EmptyState
          description="Una experiencia interna para vivir el Mundial con pronósticos, ranking y competencia amistosa."
          title="Globant digital culture + World Cup excitement"
        />
      </section>
    </main>
  );
}
