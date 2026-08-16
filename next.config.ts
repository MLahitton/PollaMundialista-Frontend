import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sin configuracion adicional: el dev server ya acepta localhost por
  // defecto, que es como se ejecuta el proyecto en cualquier equipo.
  //
  // Nota: si alguien necesita abrir el dev server desde otro dispositivo de
  // la red (por ejemplo un movil, entrando por la IP del equipo), Next lo
  // bloquea salvo que ese origen se declare en `allowedDevOrigins`. Es una
  // opcion solo de desarrollo y depende de la red de cada persona, por lo
  // que no se fija ninguna IP concreta en el repositorio.
};

export default nextConfig;
