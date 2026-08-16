import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Heebo } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/features/auth/hooks/auth-context";
import { ConnectionProvider } from "@/lib/api/connection-context";

const heebo = Heebo({
  subsets: ["latin"],
  variable: "--font-heebo",
});

export const metadata: Metadata = {
  title: "Polla Mundialista 2026",
  description: "Pronósticos y ranking para la Polla Mundialista 2026.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html className={heebo.variable} lang="es">
      <body>
        {/* ConnectionProvider envuelve a AuthProvider: la sesion necesita
            saber si un fallo fue de red antes de decidir que hacer. */}
        <ConnectionProvider>
          <AuthProvider>{children}</AuthProvider>
        </ConnectionProvider>
      </body>
    </html>
  );
}
