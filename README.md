# Ecom Full-Stack

Повноцінний full-stack e-commerce застосунок з окремими `api` (Express + MongoDB) та `client` (Next.js App Router).

## Що реалізовано

- JWT-автентифікація, профіль користувача, оновлення профілю, refresh сесії
- Ролі `user/admin` + захист адмін-функцій
- Каталог товарів: пошук, фільтри, сортування, пагінація
- CRUD товарів для адміна
- Відгуки до товарів
- Кошик та обране (favorites)
- Оформлення замовлення, історія замовлень, керування статусами
- LiqPay checkout + callback + журнал платежів
- Завантаження зображень у Cloudinary
- Підписка на email-розсилку
- Rate limiting для API/auth/upload/callback

## Технології

### Backend (`/api`)

- Node.js, Express 5, TypeScript
- MongoDB + Mongoose
- Zod (валідація)
- JWT + bcryptjs
- Cloudinary + multer

### Frontend (`/client`)

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4
- Zustand
- TanStack React Query

## Структура проєкту

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

## Локальний запуск

### 1) Backend

```bash
cd api
npm install
cp .env.example .env
npm run dev
```

API за замовчуванням: `http://localhost:9000`

### 2) Frontend

```bash
cd client
npm install
npm run dev
```

Client за замовчуванням: `http://localhost:3000`

## Docker

Потрібно:

- Docker Desktop
- заповнений `api/.env`

Запуск з кореня:

```bash
docker compose up --build -d
```

Сервіси:

- Client: `http://localhost:3000`
- API: `http://localhost:9000`

Корисні команди:

```bash
docker compose logs -f
docker compose down
```

Перевизначення портів/URL:

```bash
API_PORT=9001 NEXT_PUBLIC_API_URL=http://localhost:9001 docker compose up --build -d
```

## Environment variables

Зразок: `api/.env.example`

Критично необхідні для API:

- `MONGOOSEDB_URL`
- `JWT_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Опціонально для LiqPay (тільки парою):

- `LIQPAY_PUBLIC_KEY`
- `LIQPAY_PRIVATE_KEY`
- `LIQPAY_SANDBOX`

Клієнт використовує:

- `NEXT_PUBLIC_API_URL` (fallback: `http://localhost:9000`)

## Database seeding

Сидінг вимкнений за замовчуванням.

Увімкнення в `api/.env`:

```env
ENABLE_SEED_ROUTES=true
SEED_KEY=your_secret_key
```

Після цього викликати з заголовком `x-seed-key: your_secret_key`:

- `POST /api/seed/users`
- `POST /api/seed/products`

## NPM scripts

### `api/package.json`

- `npm run dev` - nodemon + ts-node
- `npm run start` - запуск через ts-node
- `npm run build` - компіляція TypeScript у `dist`
- `npm run prod` - запуск `dist/index.js`
- `npm test` - тести (`src/**/*.test.ts`)
- `npm run restock` - скрипт рандомного restock

### `client/package.json`

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`

## API quick reference

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
