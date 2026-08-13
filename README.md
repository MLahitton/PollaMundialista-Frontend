Polla Mundialista 2026 — Frontend

Guía de instalación, configuración y ejecución local desde un computador limpio.

Proyecto: Frontend de la Polla Mundialista 2026Stack principal: Next.js 16, React, TypeScript, Tailwind CSS, pnpm, Google Identity ServicesBackend esperado: http://localhost:8080Frontend local: http://localhost:3000Contenedores: este proyecto no usa Docker.

1. Qué necesitas instalar

1.1 Git

Descarga Git para Windows:

https://git-scm.com/install/windows

Verifica:

git --version

1.2 Node.js 24 LTS

El frontend se desarrolló sobre Node.js 24.

Descarga la versión LTS desde:

https://nodejs.org/en/download

En Windows usa el instalador x64 recomendado.

Después de instalar, cierra y vuelve a abrir PowerShell.

Verifica:

node --version
npm --version

Se recomienda Node.js 24 LTS.

1.3 pnpm

El proyecto usa pnpm, no npm ni yarn, para instalar dependencias.

Una vez instalado Node.js:

npm install -g pnpm

Verifica:

pnpm --version

El repositorio incluye pnpm-lock.yaml. Debe conservarse y utilizarse para instalar las versiones resueltas del proyecto.

1.4 Visual Studio Code — recomendado

Descarga:

https://code.visualstudio.com/docs/setup/windows

Extensiones recomendadas para frontend:

ESLint

Tailwind CSS IntelliSense

Opcionales:

GitLens

Error Lens

No necesitas extensiones Java para trabajar únicamente en frontend.

2. Clonar el repositorio

git clone https://github.com/MLahitton/polla-mundialista-2026-frontend.git
cd polla-mundialista-2026-frontend

Comprueba:

git status
git branch --show-current

Antes de empezar a trabajar:

git pull

3. Instalar dependencias

Desde la raíz del frontend:

pnpm install

El proyecto instalará las dependencias definidas en package.json y pnpm-lock.yaml.

Si aparece ERR_PNPM_IGNORED_BUILDS

En algunos equipos pnpm puede bloquear inicialmente el build script de unrs-resolver.

Si ocurre:

pnpm approve-builds

Selecciona:

unrs-resolver

Confirma y vuelve a ejecutar:

pnpm install

No apruebes paquetes desconocidos sin revisarlos.

4. Configurar .env.local

El archivo .env.local no se sube a GitHub.

En la raíz del frontend crea:

.env.local

Contenido:

NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_GOOGLE_CLIENT_ID=TU_GOOGLE_CLIENT_ID.apps.googleusercontent.com

NEXT_PUBLIC_API_BASE_URL

Para desarrollo local debe apuntar al backend:

http://localhost:8080

NEXT_PUBLIC_GOOGLE_CLIENT_ID

Solicita al responsable del proyecto el Web Client ID de Google configurado para la Polla Mundialista.

Debe ser exactamente el mismo Client ID usado en el backend como:

GOOGLE_CLIENT_ID

El Google Client ID no es secreto, pero se mantiene en .env.local para separar configuración de cada entorno. Nunca pongas JWT_SECRET, DB passwords o Google Client Secret en el frontend.

5. Google Auth y localhost

El proyecto utiliza Google Identity Services.

Para desarrollo local, el OAuth Web Client debe permitir el origen:

http://localhost:3000

Si ejecutas el frontend en otro puerto, Google puede rechazar el login hasta que ese origen sea autorizado en Google Cloud.

El frontend no almacena el Google ID Token. El flujo es:

Google Identity Services
→ Google ID Token temporal
→ POST /api/v1/auth/google
→ backend devuelve JWT propio
→ frontend guarda únicamente el JWT propio

6. El backend debe estar funcionando

Antes de probar login, partidos, pronósticos, ranking o scores, el backend debe estar disponible en:

http://localhost:8080

Puedes comprobarlo con:

http://localhost:8080/actuator/health

Si el backend no está iniciado, el frontend puede arrancar pero las funcionalidades con datos fallarán.

7. Arrancar frontend

pnpm dev

Resultado esperado:

Next.js
Local: http://localhost:3000
Ready

Abre:

http://localhost:3000

8. Primera prueba de Google Login

Abre http://localhost:3000.

Ve a login si la aplicación redirige automáticamente.

Pulsa el botón oficial Iniciar sesión con Google.

Usa una cuenta Google válida.

Si es el primer ingreso de esa cuenta, el backend crea automáticamente un Participant.

Si la cuenta ya había ingresado, reutiliza el mismo participante.

Después del login la home debe mostrar al usuario autenticado.

El JWT propio del backend se guarda en localStorage con la lógica interna de auth del proyecto.

No copies ni compartas ese token.

9. Páginas principales para probar

Home

http://localhost:3000

Debe mostrar sesión autenticada y accesos funcionales.

Partidos

http://localhost:3000/matches

Debe mostrar los próximos partidos del torneo activo.

Mis pronósticos

http://localhost:3000/predictions

Ranking

http://localhost:3000/ranking

Mis puntos

http://localhost:3000/scores

10. Cómo probar pronósticos con el reloj histórico

El frontend no controla el reloj directamente. Para pruebas históricas, un desarrollador mueve ApplicationClock desde Swagger del backend.

Ejemplo:

POST /api/v1/internal/clock/historical

Body:

{
  "instant": "2026-06-11T18:44:00Z"
}

Después refresca el frontend.

El frontend debe reflejar lo que backend responda:

OPEN_FOR_PREDICTIONS

PREDICTION_CLOSED

IN_PROGRESS

FINISHED

SCORED

No modifiques la hora del computador para probar estas reglas.

11. Flujo funcional recomendado para pruebas

Con backend y frontend levantados:

Mueve el reloj histórico antes del cierre de un partido.

Inicia sesión con Usuario A.

Crea un pronóstico.

Inicia sesión con Usuario B en otro perfil/incógnito.

Crea otro pronóstico.

Antes del cierre, cada usuario debe ver solo su propio pronóstico.

Mueve el reloj exactamente al cierre.

Refresca: ya no debe poder editarse.

Los pronósticos de los demás deben hacerse visibles.

Avanza el reloj al resultado.

Ejecuta scoring en backend.

Revisa /scores.

Revisa /ranking.

12. Resultado y scoring

El frontend no calcula puntos. Solo muestra los valores devueltos por backend.

Reglas actuales mostradas por la interfaz:

Marcador exacto: 5 puntos.

Resultado/outcome correcto: 3 puntos.

Fallo: 0 puntos.

Bonus por clasificado en penales cuando corresponda: +1.

No implementes reglas de scoring nuevas en frontend.

13. Ranking

La pantalla:

/ranking

muestra:

Top 10 general.

La posición del participante autenticado en una sección separada.

El frontend usa la posición que entrega backend; no recalcula ranking ni desempates.

14. Desarrollo diario

Al comenzar:

git pull
pnpm install
pnpm dev

pnpm install normalmente será rápido si no cambió el lockfile.

No uses npm install dentro del proyecto salvo que el equipo decida explícitamente migrar de gestor de paquetes.

15. Comandos de verificación

git --version
node --version
npm --version
pnpm --version

Opcional antes de subir cambios:

pnpm lint
pnpm build

Si el equipo todavía está trabajando activamente y una de estas validaciones falla, corrige antes de abrir PR o avisar claramente al resto del equipo.

16. Problemas comunes

pnpm no existe

npm install -g pnpm

Cierra y vuelve a abrir PowerShell.

ERR_PNPM_IGNORED_BUILDS

pnpm approve-builds

Aprueba unrs-resolver si es el paquete esperado y luego:

pnpm install

Puerto 3000 ocupado

netstat -ano | findstr :3000

Detén el proceso que usa el puerto.

Se recomienda conservar el puerto 3000 porque Google OAuth está configurado para http://localhost:3000.

Login Google no funciona

Comprueba:

.env.local existe;

NEXT_PUBLIC_GOOGLE_CLIENT_ID es correcto;

backend usa el mismo GOOGLE_CLIENT_ID;

backend está encendido;

frontend corre en http://localhost:3000;

el origen está autorizado en Google Cloud.

401 Unauthorized

La sesión puede haber expirado o el JWT no es válido.

Cierra sesión e inicia nuevamente con Google.

Error CORS

Backend debe permitir:

http://localhost:3000

Si cambiaste el puerto/origen del frontend, ajusta CORS_ALLOWED_ORIGINS en backend.

Backend no responde

Comprueba:

http://localhost:8080/actuator/health

Si no abre, revisa primero el backend.

Lista de partidos vacía en una instalación nueva

Probablemente no se haya ejecutado el importador del dataset.

En Swagger backend ejecuta:

POST /api/v1/internal/dataset/world-cup-2026/import

17. Archivos que nunca deben subirse

No publiques:

.env.local;

JWTs;

Google ID Tokens;

JWT_SECRET;

passwords PostgreSQL;

Google Client Secrets;

datos personales exportados de la base;

node_modules;

.next.

Sí debe subirse:

.env.example;

package.json;

pnpm-lock.yaml;

src/;

public/;

configuración de Next/TypeScript/Tailwind/ESLint.

18. Trabajo en equipo con Git

Antes de comenzar una tarea:

git checkout main
git pull

Crea una rama para tu trabajo:

git switch -c feature/nombre-corto

Revisa cambios:

git status
git diff

Antes de subir, evita incluir:

.env.local;

archivos generados;

cambios no relacionados con tu tarea.

El equipo debe acordar si los cambios entran por Pull Request antes de fusionarlos a main.

19. Checklist de instalación completa

Git instalado.

Node.js 24 LTS instalado.

npm operativo.

pnpm instalado.

Repositorio clonado.

pnpm install completado.

.env.local creado.

NEXT_PUBLIC_API_BASE_URL configurado.

NEXT_PUBLIC_GOOGLE_CLIENT_ID configurado.

Backend arrancado en 8080.

pnpm dev inicia en 3000.

Login Google funciona.

Home autenticada funciona.

/matches carga partidos.

/predictions carga pronósticos.

/scores carga puntos.

/ranking carga ranking.

Fuentes oficiales de instalación

Node.js: https://nodejs.org/en/download

pnpm: https://pnpm.io/

Git para Windows: https://git-scm.com/install/windows

Visual Studio Code: https://code.visualstudio.com/docs/setup/windows