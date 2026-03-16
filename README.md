# Ecom Full-Stack

A full-stack e-commerce application with separate `api` (Express) and `client` (Next.js App Router) services.

The backend uses polyglot persistence:

- `MongoDB` for the product catalog
- `PostgreSQL` for users, carts, favorites, orders, payments, promo codes, and subscribers
- `Redis` for product caching

## Implemented Features

- JWT authentication, user profile, profile update, session refresh
- `user/admin` roles with protected admin actions
- Product catalog: search, filtering, sorting, pagination
- Admin product CRUD
- Product reviews
- Cart and favorites
- Checkout flow, order history, order status management
- LiqPay checkout + callback + payment logs
- Cloudinary image uploads
- Newsletter email subscription
- Rate limiting for API/auth/upload/callback routes
- Redis caching for product list/details/filters with automatic invalidation on product changes

## Tech Stack

### Backend (`/api`)

- Node.js, Express 5, TypeScript
- MongoDB + Mongoose for catalog data
- PostgreSQL + Prisma for commerce data
- Redis (optional but recommended for caching)
- Zod (validation)
- JWT + bcryptjs
- Cloudinary + multer

### Frontend (`/client`)

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4
- Zustand
- TanStack React Query

## Project Structure

```text
ecom/
|-- api/
|   |-- prisma/
|   |-- src/
|   |   |-- config/
|   |   |-- db/
|   |   |-- middleware/
|   |   |-- models/
|   |   |-- routes/
|   |   |-- services/
|   |   |-- validation/
|   |   `-- utils/
|   |-- Dockerfile
|   `-- prisma.config.ts
|-- client/
|   |-- src/
|   |   |-- app/
|   |   |-- components/
|   |   |-- lib/
|   |   `-- store/
|   `-- Dockerfile
|-- docs/
|   `-- architecture.md
`-- docker-compose.yml
```

Architecture documentation:

- `docs/architecture.md` - C4-style diagrams and polyglot persistence notes

## Local Development

### 1) Backend

```bash
cd api
npm install
cp .env.example .env
npx prisma generate --config prisma.config.ts
npm run dev
```

Default API URL: `http://localhost:9000`

### 2) Frontend

```bash
cd client
npm install
npm run dev
```

Default client URL: `http://localhost:3000`

## Docker

Requirements:

- Docker Desktop
- configured `api/.env`

Run from project root:

```bash
docker compose up --build -d
```

Services:

- Client: `http://localhost:3000`
- API: `http://localhost:9000`
- MongoDB: `localhost:27017`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

Useful commands:

```bash
docker compose logs -f
docker compose down
```

Override ports/URL:

```bash
API_PORT=9001 NEXT_PUBLIC_API_URL=http://localhost:9001 docker compose up --build -d
```

## CI/CD (GitHub Actions)

- CI workflow: `.github/workflows/ci.yml`
- CD workflow: `.github/workflows/cd-production.yml`

### CI Checks

On `push` and `pull_request` to `main`:

- API: `npm ci`, `npm run build`, `npm test`
- Client: `npm ci`, `npm run lint`, `npm run build`

### CD Flow

On `push` to `main` (or manual `workflow_dispatch`):

- Build and push Docker images to GHCR:
  - `ghcr.io/<owner>/ecom-api:latest`
  - `ghcr.io/<owner>/ecom-client:latest`
- Optional deploy via SSH to server (if deploy secrets are configured)

Required GitHub repository secrets:

- `NEXT_PUBLIC_API_URL` (used at client image build time)
- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_SSH_KEY`
- `DEPLOY_PATH` (absolute path on server where compose/env files live)
- `DEPLOY_PORT` (optional; default `22`)

## Production Deployment

Files:

- `deploy/docker-compose.prod.yml`
- `deploy/.env.production.example`

Server setup (one-time):

```bash
mkdir -p /opt/ecom
cd /opt/ecom
# copy deploy/docker-compose.prod.yml to this folder
# copy deploy/.env.production.example as .env and fill real values
```

Set `GHCR_OWNER` in server `.env` to your GitHub org/user.  
The deploy job will run:

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --remove-orphans
```

If deploy secrets are missing, CD still builds and pushes images only.

## Environment Variables

Template: `api/.env.example`

Required API variables:

- `MONGODB_URL`
- `POSTGRES_URL`
- `JWT_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Optional LiqPay variables (must be set together):

- `LIQPAY_PUBLIC_KEY`
- `LIQPAY_PRIVATE_KEY`
- `LIQPAY_SANDBOX`

Optional cache variables:

- `REDIS_URL` (when omitted, cache layer is disabled)
- `REDIS_KEY_PREFIX`
- `CACHE_TTL_SECONDS`

Client variable:

- `NEXT_PUBLIC_API_URL` (fallback: `http://localhost:9000`)

## Database Seeding

Seeding is disabled by default.

Enable in `api/.env`:

```env
ENABLE_SEED_ROUTES=true
SEED_KEY=your_secret_key
```

Then call endpoints with header `x-seed-key: your_secret_key`:

- `POST /api/seed/users`
- `POST /api/seed/products`

## Migrations

Initial Prisma migration:

- `api/prisma/migrations/20260316_init_commerce/migration.sql`

Generate Prisma client:

```bash
cd api
npx prisma generate --config prisma.config.ts
```

Apply migrations to PostgreSQL:

```bash
cd api
npx prisma migrate deploy --config prisma.config.ts
```

For local development with a running database, you can also use:

```bash
cd api
npx prisma migrate dev --config prisma.config.ts
```

## Smoke Test

After `docker compose up --build -d`, use this quick checklist:

1. Open `http://localhost:9000/` and verify the API returns `{"status":"ok","service":"api"}`.
2. Call `POST /api/seed/users` and `POST /api/seed/products` with the `x-seed-key` header if seed routes are enabled.
3. Register a new user or log in as the seeded admin.
4. Open the storefront and confirm products load from MongoDB.
5. Add a product to cart and favorites, then refresh and confirm the data persists.
6. Create an order and verify it appears in `myorders`.
7. Open the admin page and verify orders, promo codes, and payment logs load.
8. If LiqPay is configured, test checkout creation for an unpaid order.

## NPM Scripts

### `api/package.json`

- `npm run dev` - nodemon + ts-node
- `npm run start` - run with ts-node
- `npm run build` - compile TypeScript to `dist`
- `npm run prod` - run `dist/index.js`
- `npm run test` - run tests (`src/**/*.test.ts`)
- `npm run restock` - random restock script
- `npm run prisma:generate` - generate Prisma client

### `client/package.json`

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`

## API Quick Reference

### Auth / Users

- `POST /api/users/register`
- `POST /api/users/login`
- `GET /api/users/profile`
- `PUT /api/users/profile`
- `POST /api/users/refresh`

### Products

- `GET /api/products`
- `GET /api/products/filters`
- `GET /api/products/:id`
- `POST /api/products` (admin)
- `PUT /api/products/:id` (admin)
- `DELETE /api/products/:id` (admin)
- `POST /api/products/restock-random` (admin)
- `POST /api/products/:id/reviews`
- `DELETE /api/products/:id/reviews/:reviewId` (admin)

### Orders

- `POST /api/orders`
- `GET /api/orders/myorders`
- `GET /api/orders/:id`
- `PUT /api/orders/:id/pay`
- `PUT /api/orders/:id/deliver` (admin)
- `PUT /api/orders/:id/status` (admin)
- `DELETE /api/orders/:id` (admin)
- `GET /api/orders` (admin)
- `GET /api/orders/stats` (admin)
- `GET /api/orders/payment-logs` (admin)
- `POST /api/orders/:id/liqpay/checkout`
- `POST /api/orders/liqpay/callback`

### Cart / Favorites / Subscribers / Upload

- `GET /api/cart`
- `POST /api/cart`
- `DELETE /api/cart`
- `GET /api/favorites`
- `POST /api/favorites/toggle`
- `DELETE /api/favorites`
- `POST /api/subscribers`
- `POST /api/upload` (admin)
