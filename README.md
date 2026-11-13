# 🏦 Bckd Bank

Aplicación bancaria de demostración con **backend en Spring Boot** y **frontend en React**.
Permite registrarse, iniciar sesión, ver tus cuentas y saldos, transferir dinero a otras cuentas
y consultar tu historial de movimientos.

## Tecnologías

| Parte | Tecnologías |
|---|---|
| **Backend** (`bckdbank/`) | Java 17, Spring Boot, Spring Security, JWT, Spring Data JPA, MySQL, Swagger |
| **Frontend** (`bckdbank-front/`) | React, TypeScript, Vite, React Router, Lucide Icons |

## Funcionalidades

- Registro de usuarios: cada usuario nuevo recibe una cuenta de ahorros con **$1.000** de saldo inicial.
- Inicio y cierre de sesión con **JWT**. La sesión dura 24 horas.
- Resumen financiero: saldo total, cuentas y número de movimientos.
- Transferencias entre cuentas, con validación de saldo y de cuenta destino.
- Historial de movimientos y panel de flujo de caja (entradas, salidas y neto).
- Panel de mercado con cotizaciones de acciones vía [Finnhub](https://finnhub.io). Es opcional.

## ¿Cómo se comunican?

```
Navegador ──► Frontend Vite (localhost:5173) ──proxy /api──► Backend Spring Boot (localhost:8080) ──► MySQL
```

- El frontend hace todas sus peticiones HTTP desde `bckdbank-front/src/lib/api.ts`.
- Vite reenvía todo lo que empieza por `/api` al backend (`bckdbank-front/vite.config.ts`).
- Al iniciar sesión, el backend devuelve un **token JWT**. El frontend lo guarda y lo envía en cada
  petición con el header `Authorization: Bearer <token>`.

## Requisitos

- Java 17+
- Node.js 20+
- MySQL 8+

## Cómo ejecutarla

### 1. Configurar la base de datos
El backend crea la base `db_bank` automáticamente. Solo necesitas MySQL encendido.

Para no subir tu contraseña a GitHub, crea el archivo `bckdbank/config/application.yml`.
Este archivo está ignorado por git:

```yaml
spring:
    datasource:
        username: root
        password: TU_CLAVE_DE_MYSQL
```

### 2. Backend
```bash
cd bckdbank
./mvnw spring-boot:run
```
La API queda en `http://localhost:8080`.
La documentación interactiva (Swagger) está en `http://localhost:8080/swagger-ui.html`.

### 3. Frontend
```bash
cd bckdbank-front
npm install
npm run dev
```
Abre `http://localhost:5173` en el navegador.

## Variables de entorno (opcionales)

| Variable | Para qué sirve |
|---|---|
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | Conexión a MySQL |
| `JWT_SECRET` | Clave para firmar los tokens. **Cámbiala si despliegas la app.** |
| `FINNHUB_API_KEY` | Activa el panel de mercado. Hay una clave gratis en [finnhub.io](https://finnhub.io/register). |
| `CORS_ALLOWED_ORIGINS` | URLs del frontend autorizadas a llamar a la API |

## Endpoints principales

| Método | Ruta | Descripción | Requiere token |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Registrar usuario | No |
| POST | `/api/v1/auth/login` | Iniciar sesión | No |
| GET | `/api/v1/accounts` | Mis cuentas | Sí |
| GET | `/api/v1/accounts/{numero}` | Detalle de una cuenta | Sí |
| POST | `/api/v1/transactions/transfer` | Realizar una transferencia | Sí |
| GET | `/api/v1/transactions/account/{numero}` | Historial de una cuenta | Sí |
| GET | `/api/v1/market/quote?symbol=AAPL` | Cotización de una acción | Sí |
| GET | `/api/v1/market/profile?symbol=AAPL` | Perfil de una empresa | Sí |

## Estructura del proyecto

```
MyBankProject/
├── bckdbank/                 # Backend Spring Boot
│   └── src/main/java/com/danidevbank/demo/
│       ├── controller/       # Endpoints REST
│       ├── service/          # Lógica de negocio
│       ├── repository/       # Acceso a MySQL (JPA)
│       ├── entity/           # Tablas: User, Account, Transaction
│       ├── dto/              # Datos que entran y salen de la API
│       ├── security/         # Filtro y generación de JWT
│       ├── config/           # Seguridad, CORS y Swagger
│       └── exception/        # Manejo de errores
└── bckdbank-front/           # Frontend React
    └── src/
        ├── components/       # Pantallas y paneles de la interfaz
        ├── lib/api.ts        # Comunicación con el backend
        └── App.tsx           # Estado global, sesión y rutas
```

---
Proyecto de aprendizaje · Entorno de demostración
