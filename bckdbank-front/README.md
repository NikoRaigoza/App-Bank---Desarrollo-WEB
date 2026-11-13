# Bckd Bank · Frontend

Frontend en React + TypeScript + Vite para el backend Spring Boot `bckdbank`.

## Cómo correr la aplicación completa

1. **MySQL** encendido (por defecto `localhost:3306`, usuario `root`, contraseña `root`).
   Si tu contraseña es otra, arranca el backend con `DB_PASSWORD=tu_clave`.
2. **Backend** (carpeta `bckdbank`):
   ```bash
   ./mvnw spring-boot:run
   ```
   Queda en `http://localhost:8080`. Opcional: `FINNHUB_API_KEY=tu_clave ./mvnw spring-boot:run`
   para activar el panel de mercado (clave gratis en https://finnhub.io/register).
3. **Frontend** (esta carpeta):
   ```bash
   npm install
   npm run dev
   ```
   Abre `http://localhost:5173`.

## Cómo se conecta con el backend

- `src/lib/api.ts` contiene **todas** las llamadas HTTP (`fetch`) a `/api/v1/...`.
- `vite.config.ts` tiene un *proxy*: toda petición a `/api` se reenvía a `VITE_BACKEND_URL`
  (definido en `.env`, por defecto `http://localhost:8080`).
- Tras el login, el token JWT se guarda en `localStorage` (`bckdbank.session`) y se envía en
  cada petición como `Authorization: Bearer <token>`.
- Si el backend responde 401 (token vencido o inválido), la app cierra la sesión y vuelve al login.

## Scripts

- `npm run dev` – servidor de desarrollo
- `npm run build` – compila para producción en `dist/`
- `npm run lint` – revisa el código con ESLint
