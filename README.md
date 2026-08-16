# Polla Mundialista — Frontend

## 1. Descripción del Proyecto

Polla Mundialista es una aplicación para competir pronosticando los partidos del **Mundial 2026**: cada persona predice los marcadores, suma puntos según sus aciertos y compite con el resto en un ranking.

Este repositorio contiene **únicamente el frontend**: la interfaz web donde el usuario inicia sesión con Google, revisa los partidos del torneo activo, guarda sus pronósticos antes del cierre, consulta sus puntos y mira el ranking.

El frontend no calcula nada por su cuenta: muestra la información que entrega el backend. Por eso necesita que el backend esté encendido para funcionar.

> **Repositorio del backend:** https://github.com/MLahitton/PollaMundialista-Backend
>
> La API del proyecto está en ese repositorio, con su propia guía de instalación.

---

## 2. Objetivo

Ofrecer una interfaz web simple para que cualquier participante pueda iniciar sesión, pronosticar los partidos del Mundial 2026 y seguir sus puntos y su posición en el ranking.

---

## 3. Características Destacadas

- Inicio de sesión con Google (Google Identity Services).
- Sesión guardada en el navegador para no tener que entrar en cada recarga.
- Lista de próximos partidos del torneo activo, con estado de cada uno (abierto, cerrado, en juego, finalizado, puntuado).
- Detalle de partido para crear o editar el pronóstico mientras esté abierto.
- Vista de los pronósticos de los demás participantes una vez cerrado el partido.
- Página "Mis pronósticos" con todo lo que guardaste en el torneo activo.
- Página "Mis puntos" con el detalle de cada partido ya puntuado.
- Ranking con el Top 10 y tu posición actual.
- Contador de partidos pendientes de pronosticar en el menú lateral.
- Aviso automático en pantalla cuando el backend no responde.
- Diseño responsive (escritorio y móvil).

---

## 4. Tecnologías Utilizadas

| Tecnología | Uso |
|---|---|
| Next.js 16 | Framework del frontend (App Router) |
| React 19 | Interfaz y componentes |
| TypeScript | Lenguaje de desarrollo |
| Tailwind CSS 4 | Estilos |
| Google Identity Services | Inicio de sesión con Google |
| ESLint | Revisión de código |
| pnpm | Gestor de dependencias |

---

## 5. Instalación y Configuración

### Paso 1 — Instalar lo necesario

Necesitas tres programas:

- **Git** — para descargar el proyecto.
- **Node.js 24 o superior** — para poder ejecutar el frontend.
- **pnpm 11** — para instalar las dependencias del proyecto.

Descargas oficiales:

- Git: https://git-scm.com/downloads
- Node.js (versión LTS): https://nodejs.org/en/download

Con Node.js ya instalado, instala pnpm:

```bash
npm install -g pnpm
```

Cierra y vuelve a abrir la terminal, y comprueba que todo quedó bien:

```bash
git --version
node -v
pnpm -v
```

Debes ver una versión de Node **24 o superior** y una versión de pnpm **11 o superior**.

---

### Paso 2 — Descargar el proyecto

```bash
git clone https://github.com/MLahitton/PollaMundialista-Frontend.git
cd PollaMundialista-Frontend
```

---

### Paso 3 — Instalar las dependencias

```bash
pnpm install
```

Si aparece el error `ERR_PNPM_IGNORED_BUILDS`, ejecuta `pnpm approve-builds`, aprueba `unrs-resolver` y vuelve a ejecutar `pnpm install`.

---

### Paso 4 — Configurar las variables de entorno

El proyecto ya trae el archivo `.env.example` con las variables que necesita. **No las crees desde cero: copia ese archivo.**

En PowerShell (Windows):

```powershell
Copy-Item .env.example .env.local
```

En Git Bash / macOS / Linux:

```bash
cp .env.example .env.local
```

Abre el archivo `.env.local` que acabas de crear y complétalo:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_GOOGLE_CLIENT_ID=TU_CLIENT_ID.apps.googleusercontent.com
```

- `NEXT_PUBLIC_API_BASE_URL`: dirección del backend. Para trabajar en tu computador se deja tal cual viene: `http://localhost:8080`.
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: viene vacío. **Pídeselo al responsable del proyecto.** Debe ser el mismo Client ID de Google que usa el backend, o el login fallará.

`.env.local` no se sube a GitHub (está en `.gitignore`). Nunca pongas contraseñas ni secretos en este archivo: el frontend solo usa estas dos variables.

---

### Paso 5 — Encender el backend

Este frontend **no funciona solo**. Antes de continuar, el backend debe estar corriendo en la dirección que pusiste en `NEXT_PUBLIC_API_BASE_URL` (por defecto `http://localhost:8080`).

Si todavía no lo tienes instalado, sigue la guía de su repositorio:
https://github.com/MLahitton/PollaMundialista-Backend

Si el backend está apagado podrás abrir la web, pero verás un aviso de conexión y no cargará ningún dato.

---

### Paso 6 — Ejecutar el proyecto

```bash
pnpm dev
```

La aplicación queda disponible en:

```
http://localhost:3000
```

Mantén el puerto **3000**: el inicio de sesión con Google está autorizado para `http://localhost:3000`. Si usas otro puerto, Google puede rechazar el login.

Para detenerlo, presiona `Ctrl + C` en la terminal.

---

### Paso 7 — Iniciar sesión

1. Abre http://localhost:3000 en el navegador.
2. La aplicación te llevará a la pantalla de inicio de sesión.
3. Pulsa el botón **Iniciar sesión con Google** y elige tu cuenta.
4. Si el inicio de sesión fue correcto, entrarás a la pantalla principal con tu nombre y tu foto.

---

### Paso 8 — Verificar que funciona

Con la sesión abierta, entra a estas páginas y confirma que cargan datos:

| Página | Dirección | Qué debe mostrar |
|---|---|---|
| Inicio | http://localhost:3000 | Tu nombre y los accesos principales |
| Partidos | http://localhost:3000/matches | Los próximos partidos del torneo |
| Mis pronósticos | http://localhost:3000/predictions | Tus pronósticos guardados |
| Ranking | http://localhost:3000/ranking | El Top 10 y tu posición |
| Mis puntos | http://localhost:3000/scores | Tus partidos ya puntuados |

Si las páginas cargan sin errores, la instalación está lista.

---

## 6. Comandos disponibles

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Ejecuta el proyecto en modo desarrollo (puerto 3000) |
| `pnpm build` | Genera la versión de producción |
| `pnpm start` | Ejecuta la versión de producción (puerto 3000) |
| `pnpm lint` | Revisa el código con ESLint |

---

## 7. Problemas frecuentes

| Problema | Solución |
|---|---|
| `pnpm` no se reconoce | Ejecuta `npm install -g pnpm` y reinicia la terminal |
| `ERR_PNPM_IGNORED_BUILDS` al instalar | `pnpm approve-builds`, aprueba `unrs-resolver` y repite `pnpm install` |
| El botón de Google no aparece | Falta `NEXT_PUBLIC_GOOGLE_CLIENT_ID` en `.env.local`, o no reiniciaste `pnpm dev` después de editarlo |
| El login con Google falla | El Client ID no es el mismo que usa el backend, o no estás en `http://localhost:3000` |
| Aviso de "sin conexión" o páginas vacías | El backend no está encendido en `http://localhost:8080` |
| El puerto 3000 está ocupado | Cierra el otro programa que lo use; conviene mantener el 3000 por el login de Google |

> Después de cambiar `.env.local`, detén el servidor con `Ctrl + C` y vuelve a ejecutar `pnpm dev`.

## 20. Autores

Proyecto desarrollado por:

- **Manuel José Gómez Laiton** 
- **Valentina Mancilla** 
- **Tomas Esteban González Quintero**
- **Sara Brigete Carlier Méndez**
- **luis**

Polla Mundialista 2026, proyecto universitario desarrollado en el marco de Globant.
