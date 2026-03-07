# 🛒 Ecom — Full-Stack E-Commerce Platform

A modern full-stack e-commerce application built with a scalable architecture, secure authentication, admin dashboard, and production-oriented engineering practices.

This project demonstrates real-world backend & frontend integration using TypeScript across the entire stack.

---

## 🚀 Tech Stack

### Backend (`/api`)

- **Node.js + Express**
- **TypeScript**
- **MongoDB + Mongoose**
- **JWT Authentication**
- **Zod validation**
- **Cloudinary (image uploads)**
- Layered architecture (routes → controllers → services → models)

### Frontend (`/client`)

- **Next.js 16 (App Router)**
- **TypeScript**
- **Tailwind CSS**
- **Zustand (client state)**
- **React Query (server state & caching)**

---

## ✨ Core Features

### 👤 Authentication & Security

- JWT-based authentication
- Role-based access control (Admin/User)
- Protected API routes
- Secure password hashing (bcrypt)
- Environment variable validation
- Protected database seeding

---

### 🛍 Product Management

- Product listing
- Admin CRUD operations
- Image upload via Cloudinary
- Stock management
- Input validation with Zod

---

### 🧾 Orders & Checkout

- Order creation flow
- Order history (user dashboard)
- Admin order management
- Order status system (pending, paid, shipped, delivered)

---

### 🛠 Admin Dashboard

- Product creation / editing / deletion
- Order overview
- Role-based route protection
- Clean UI with structured state management

---

## 🧠 Architecture Overview

This project follows a scalable backend structure:

```
routes → controllers → services → models
```

Key engineering decisions:

- Centralized error handling
- Strong TypeScript typing (custom Express request types)
- Separation of client and server state
- Secure environment configuration
- Clean folder structure for scalability

---

## 📁 Project Structure

```
ecom/
├── api/        # Express backend
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   └── utils/
│
└── client/     # Next.js frontend
    ├── app/
    ├── components/
    ├── store/
    └── types/
```

---

## ⚙️ Local Development

### Requirements

- Node.js 18+
- MongoDB (Atlas or local)

---

### Backend Setup

```bash
cd api
npm install
cp .env.example .env
npm run dev
```

Runs on:

```
http://localhost:9000
```

---

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

Runs on:

```
http://localhost:3000
```

---

### Docker Setup

Requirements:

- Docker Desktop
- Filled `api/.env`

From project root:

```bash
docker compose up --build -d
```

Services:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:9000`

Useful commands:

```bash
docker compose logs -f
docker compose down
```

Optional API URL override for client build/runtime:

```bash
NEXT_PUBLIC_API_URL=http://localhost:9000 docker compose up --build -d
```

Optional API port override:

```bash
API_PORT=9001 NEXT_PUBLIC_API_URL=http://localhost:9001 docker compose up --build -d
```

---

## 🌱 Database Seeding

Seeding is protected and disabled by default.

To enable:

```
ENABLE_SEED_ROUTES=true
SEED_KEY=your_secret_key
```

Then send:

```
POST /api/seed/users
POST /api/seed/products
```

---

## 🔐 API Highlights

### Authentication

```
POST /api/users/register
POST /api/users/login
GET  /api/users/profile
```

### Products

```
GET    /api/products
POST   /api/products      (Admin)
PUT    /api/products/:id  (Admin)
DELETE /api/products/:id  (Admin)
```

### Orders

```
POST /api/orders
GET  /api/orders/myorders
GET  /api/orders/:id
```

---

## 🚀 Engineering Focus

This project was built with an emphasis on:

- Type safety across the stack
- Scalable backend structure
- Clear separation of concerns
- Security best practices
- Production-oriented architecture

It is not just a CRUD demo — it is structured as a real-world application foundation.

---

## 📌 Roadmap

- Pagination & filtering
- Stripe payment integration
- Docker & CI/CD
- Production deployment
- Performance optimizations

---

## 📄 License

Educational project built for portfolio and professional g
