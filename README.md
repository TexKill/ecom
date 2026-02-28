# 🛒 Ecom — Full-Stack E-Commerce App

A full-stack e-commerce application built with Node.js, Express, MongoDB, and Next.js 15.

## 🚀 Tech Stack

### Backend (`/api`)
- **Node.js** + **Express** — REST API
- **TypeScript** — type safety
- **MongoDB** + **Mongoose** — database
- **JWT** — authentication
- **bcryptjs** — password hashing
- **Cloudinary** + **Multer** — image uploads

### Frontend (`/client`)
- **Next.js 15** (App Router, Turbopack)
- **TypeScript**
- **Tailwind CSS** — styling
- **Zustand** — global state management (cart and user)
- **React Query** — server state & caching
- **Lucide React** — icons

---

## 📁 Project Structure

```
ecom/
├── api/                        # Express backend
│   ├── src/
│   │   ├── data/               # Seed data
│   │   │   ├── Products.ts
│   │   │   └── Users.ts
│   │   ├── middleware/
│   │   │   └── Auth.ts         # JWT route protection
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Product.ts
│   │   │   └── Order.ts
│   │   ├── routes/
│   │   │   ├── User.ts
│   │   │   ├── Product.ts
│   │   │   ├── Order.ts
│   │   │   └── Upload.ts       # Cloudinary image upload
│   │   ├── types/
│   │   │   ├── index.ts        # IUser, IProduct, IOrder
│   │   │   └── express.d.ts    # Express Request extension
│   │   ├── utils/
│   │   │   └── tokenGenerate.ts
│   │   ├── databaseSeeder.ts
│   │   └── index.ts
│   ├── .env.example
│   ├── tsconfig.json
│   └── package.json
│
└── client/                     # Next.js frontend
    ├── src/
    │   ├── app/                # App Router pages
    │   ├── components/         # Reusable components
    │   ├── store/              # Zustand stores
    │   └── types/              # TypeScript types
    └── package.json
```

---

## ⚙️ Getting Started

### Requirements

- Node.js 18+
- npm or yarn
- MongoDB Atlas account or local MongoDB instance

### Installation

```bash
git clone https://github.com/TexKill/ecom.git
cd ecom
```

### Backend

```bash
cd api
npm install
cp .env.example .env   # fill in your values
npm run dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```

API runs on `http://localhost:9000`  
Client runs on `http://localhost:3000`

---

### Building for Production

```bash
npm run build   # Compiles TypeScript to dist/
npm start       # Runs compiled dist/index.js
```

---

## 🌱 Database Seeding

> ⚠️ Seed users **before** products.

```bash
POST http://localhost:9000/api/seed/users
POST http://localhost:9000/api/seed/products
```

---

## 📡 API Reference

### 🔑 Authentication

All protected routes require a **JWT Bearer Token**:

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

### Products `/api/products`

| Method | Endpoint | Description | Protected |
|--------|----------|-------------|-----------|
| `GET` | `/` | Get all products | — |
| `GET` | `/:id` | Get single product | — |
| `POST` | `/` | Create a new product | ✅ Admin |
| `PUT` | `/:id` | Update product details | ✅ Admin |
| `DELETE` | `/:id` | Delete a product | ✅ Admin |

---

### Orders `/api/orders`

| Method | Endpoint | Description | Protected |
|--------|----------|-------------|-----------|
| `POST` | `/` | Create a new order | ✅ JWT |
| `GET` | `/my` | Get logged-in user's orders | ✅ JWT |
| `GET` | `/:id` | Get order by ID | ✅ JWT |

---

### Upload `/api/upload`

| Method | Endpoint | Description | Protected |
|--------|----------|-------------|-----------|
| `POST` | `/` | Upload image to Cloudinary | — |

**Request:** `form-data` з полем `image` (файл)  
**Response:**
```json
{
  "url": "https://res.cloudinary.com/..."
}
```

---

## 👤 Test Accounts

After seeding the database, test accounts are available.
Credentials are defined in `api/src/data/Users.ts`.

---

## 📌 Roadmap

### Backend
- [x] Project architecture & folder structure
- [x] TypeScript setup
- [x] MongoDB connection & Mongoose schemas
- [x] JWT authentication & route protection
- [x] User registration, login, profile
- [x] Database seeder (users + products)
- [x] Product CRUD routes
- [x] Order management routes
- [x] Image upload with Cloudinary
- [ ] Admin routes & middleware
- [ ] Input validation (Zod)
- [ ] Pagination & search

### Frontend
- [x] Next.js 15 project setup
- [x] Product listing page
- [x] Product detail page
- [x] Shopping cart (Zustand)
- [ ] Authentication flow
- [ ] Checkout flow
- [ ] Order history page
- [ ] Admin dashboard

### DevOps
- [ ] Docker + docker-compose
- [ ] CI/CD pipeline
- [ ] Deployment to VPS

---

## 📄 License

This project is for educational purposes only.

