# 🛒 E-Commerce Platform

A scalable, full-stack e-commerce platform built with React, Next.js, TypeScript, and Node.js as a university thesis project. The platform supports product browsing, user authentication, order management, and an admin dashboard.

## 🚀 Tech Stack

### Backend
- **Node.js** + **Express** — REST API server
- **TypeScript** — static typing across the entire codebase
- **MongoDB** + **Mongoose** — NoSQL database with typed schemas
- **JWT (jsonwebtoken)** — stateless authentication
- **bcryptjs** — secure password hashing
- **express-async-handler** — clean async error handling

### Frontend _(in development)_
- **Next.js 15** (App Router) — SSR/SSG for SEO-optimized pages
- **React 18** + **TypeScript**
- **Tailwind CSS** — utility-first styling
- **Zustand** — global state management (cart, user)
- **React Query** — server state & caching

## 📁 Project Structure

```
ecommerce/
├── api/                             # Backend (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── data/                    # Seed data
│   │   │   ├── Products.ts
│   │   │   └── Users.ts
│   │   ├── middleware/
│   │   │   └── Auth.ts              # JWT route protection middleware
│   │   ├── models/                  # Mongoose models
│   │   │   ├── User.ts
│   │   │   ├── Product.ts
│   │   │   └── Order.ts
│   │   ├── routes/                  # Express route handlers
│   │   │   ├── User.ts
│   │   │   ├── Product.ts           # in development
│   │   │   └── Order.ts             # in development
│   │   ├── types/
│   │   │   ├── index.ts             # IUser, IProduct, IOrder, IReview
│   │   │   └── express.d.ts         # Express Request extension (req.user)
│   │   ├── utils/
│   │   │   └── tokenGenerate.ts     # JWT token generator
│   │   ├── databaseSeeder.ts        # Seed routes
│   │   └── index.ts                 # App entry point
│   ├── .env
│   ├── tsconfig.json
│   └── package.json
│
└── client/                          # Frontend (Next.js 15) — in development
    ├── app/
    ├── components/
    ├── types/
    └── package.json
```

## ⚙️ Getting Started

### Requirements

- Node.js 18+
- npm or yarn
- MongoDB Atlas account or local MongoDB instance

### Installation

```bash
# Clone the repository
git clone https://github.com/TexKill/ecommerce.git
cd ecommerce

# Install backend dependencies
cd api
npm install
```

### Environment Variables

Create a `.env` file inside the `api/` directory:

```env
PORT=9000
MONGOOSEDB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

> ⚠️ Never commit your `.env` file. It is already listed in `.gitignore`.

### Running the Development Server

```bash
cd api
npm run dev
```

Expected output:
```
Server is listening on port: 9000
Connected to MongoDB
```

### Building for Production

```bash
npm run build   # Compiles TypeScript to dist/
npm start       # Runs compiled dist/index.js
```

## 🌱 Database Seeding

Populate the database with sample users and products for development and testing.

> ⚠️ Users must be seeded **before** products, as products require an admin user reference.

```bash
# Step 1 — seed users
POST http://localhost:9000/api/seed/users

# Step 2 — seed products
POST http://localhost:9000/api/seed/products
```

## 📡 API Reference

### 🔑 Authentication

All protected routes require a **JWT Bearer Token** in the request header:

```
Authorization: Bearer <your_token>
```

---

### Users `/api/users`

| Method | Endpoint | Description | Protected |
|--------|----------|-------------|-----------|
| `POST` | `/register` | Register a new user | — |
| `POST` | `/login` | Login and receive JWT token | — |
| `GET` | `/profile` | Get current user profile | ✅ JWT |
| `PUT` | `/profile` | Update name, email or password | ✅ JWT |

**Register / Login request body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456"
}
```

**Successful login response:**
```json
{
  "_id": "64f...",
  "name": "John Doe",
  "email": "john@example.com",
  "isAdmin": false,
  "token": "eyJhbGci..."
}
```

---

### Products `/api/products` _(in development)_

| Method | Endpoint | Description | Protected |
|--------|----------|-------------|-----------|
| `GET` | `/` | Get all products (with pagination & filters) | — |
| `GET` | `/:id` | Get single product by ID | — |
| `POST` | `/` | Create a new product | ✅ Admin |
| `PUT` | `/:id` | Update product details | ✅ Admin |
| `DELETE` | `/:id` | Delete a product | ✅ Admin |
| `POST` | `/:id/reviews` | Add a product review | ✅ JWT |

---

### Orders `/api/orders` _(in development)_

| Method | Endpoint | Description | Protected |
|--------|----------|-------------|-----------|
| `POST` | `/` | Create a new order | ✅ JWT |
| `GET` | `/myorders` | Get logged-in user's orders | ✅ JWT |
| `GET` | `/:id` | Get order by ID | ✅ JWT |
| `PUT` | `/:id/pay` | Mark order as paid | ✅ JWT |
| `PUT` | `/:id/deliver` | Mark order as delivered | ✅ Admin |

---

### Admin `/api/admin` _(in development)_

| Method | Endpoint | Description | Protected |
|--------|----------|-------------|-----------|
| `GET` | `/users` | Get all users | ✅ Admin |
| `DELETE` | `/users/:id` | Delete a user | ✅ Admin |
| `GET` | `/orders` | Get all orders | ✅ Admin |

## 👤 Test Accounts

After running the seed route, the following accounts are available:

| Email | Password | Role |
|-------|----------|------|
| `admin@example.com` | `123456` | Admin |
| `john@example.com` | `123456` | User |

## 📌 Development Roadmap

### Backend
- [x] Project architecture & folder structure
- [x] TypeScript migration (models, routes, middleware)
- [x] MongoDB connection & Mongoose schemas
- [x] JWT authentication & route protection
- [x] User registration, login, profile
- [x] Database seeder (users + products)
- [ ] Product CRUD routes
- [ ] Order management routes
- [ ] Admin routes & middleware
- [ ] Input validation (Zod or express-validator)
- [ ] Pagination & search for products

### Frontend
- [ ] Next.js 15 project setup
- [ ] Authentication flow (login/register pages)
- [ ] Product listing & detail pages
- [ ] Shopping cart (Zustand)
- [ ] Checkout flow
- [ ] Order history page
- [ ] Admin dashboard

### DevOps
- [ ] Docker + docker-compose setup
- [ ] CI/CD pipeline
- [ ] Deployment to VPS

## 🤝 Contributing

This is a university thesis project and is not open for external contributions at this time.

## 📄 License

This project is for educational purposes only.
