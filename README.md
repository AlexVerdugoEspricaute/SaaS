# CI: [reemplaza OWNER/REPO en la URL del badge]
![CI](https://github.com/OWNER/REPO/actions/workflows/ci.yml/badge.svg)

# SaaS MVP (SQLite)

Scaffold mínimo con Node + Express + Prisma usando SQLite para desarrollo. Diseñado para migrar luego a Postgres/Neon.

Setup rápido:

1. Instalar dependencias

```bash
npm install
```

2. Generar cliente Prisma y ejecutar migración inicial (crea `dev.db`)

```bash
npx prisma generate
npx prisma migrate dev --name init
```

3. Levantar servidor en modo desarrollo

```bash
npm run dev
```

Endpoints básicos:

- `GET /health` — estado
- `GET /projects` — lista de proyectos
- `POST /tenants` — crear tenant
- `POST /projects` — crear proyecto (body: `{ name, tenantId }`)

**Despliegue (rápido)**

Recomendado: usar Postgres en producción (p. ej. Neon, Heroku Postgres). A continuación pasos rápidos para Vercel y Heroku.

- Vercel
	- Crear proyecto en Vercel y vincular el repo.
	- Definir variables de entorno en Vercel: `DATABASE_URL` (ej. `postgresql://...`), `JWT_SECRET`.
	- Comando de build: `npm ci && npx prisma generate && npm run prisma:migrate -- --name init && npm run build` (si añades build) o dejar `start` para Node.
	- Vercel ejecutará `npm start` o lo que configures.

- Heroku
	- Crear app en Heroku y añadir add-on `Heroku Postgres`.
	- En Settings → Config Vars añadir `DATABASE_URL` y `JWT_SECRET`.
	- En el Procfile (opcional) poner: `web: node src/server.js`.
	- Push a Heroku: `git push heroku main`.

Notas importantes:
- En desarrollo usamos SQLite (`DATABASE_URL="file:./dev.db"`) pero para producción debes usar Postgres y actualizar `prisma/schema.prisma` si necesitas características específicas.
- Asegura `JWT_SECRET` en producción y no uses el `dev-secret` por defecto.
- Reemplaza el badge de CI en la parte superior por `OWNER/REPO` para que muestre el estado real de GitHub Actions.

Comandos útiles locales:

```bash
npx prisma generate
npx prisma migrate deploy # en CI/prod
npm run seed
npm run dev
```
