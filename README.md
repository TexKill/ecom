# Ecom Full-Stack

A full-stack e-commerce application with separate `api` (Express + MongoDB) and `client` (Next.js App Router) services.

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

## Tech Stack

### Backend (`/api`)

- Node.js, Express 5, TypeScript
- MongoDB + Mongoose
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
|   |-- src/
|   |   |-- config/
|   |   |-- middleware/
|   |   |-- models/
|   |   |-- routes/
|   |   |-- services/
|   |   |-- validation/
|   |   `-- utils/
|   `-- Dockerfile
|-- client/
|   |-- src/
|   |   |-- app/
|   |   |-- components/
|   |   |-- lib/
|   |   `-- store/
|   `-- Dockerfile
`-- docker-compose.yml
```

## Local Development

### 1) Backend

```bash
cd api
npm install
cp .env.example .env
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

Useful commands:

```bash
docker compose logs -f
docker compose down
```

Override ports/URL:

```bash
API_PORT=9001 NEXT_PUBLIC_API_URL=http://localhost:9001 docker compose up --build -d
```

## Environment Variables

Template: `api/.env.example`

Required API variables:

- `MONGOOSEDB_URL`
- `JWT_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Optional LiqPay variables (must be set together):

- `LIQPAY_PUBLIC_KEY`
- `LIQPAY_PRIVATE_KEY`
- `LIQPAY_SANDBOX`

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

## NPM Scripts

### `api/package.json`

- `npm run dev` - nodemon + ts-node
- `npm run start` - run with ts-node
- `npm run build` - compile TypeScript to `dist`
- `npm run prod` - run `dist/index.js`
- `npm test` - run tests (`src/**/*.test.ts`)
- `npm run restock` - random restock script

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
