import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Heebo } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/features/auth/hooks/auth-context";

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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
