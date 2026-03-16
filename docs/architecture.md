# Architecture and Refactoring Notes

This document summarizes the refactored architecture of the `ecom` project after the transition to polyglot persistence. The diagrams use a C4-style structure in Mermaid so they can be reused in the thesis/report and discussed with the instructor.

## 1. Current State

The application is implemented as a modular monolith:

- `client`: Next.js storefront and admin UI
- `api`: Express REST API with business logic
- `MongoDB`: product catalog database
- `PostgreSQL`: commerce database
- `Redis`: optional cache for product reads
- `Cloudinary`: image storage
- `LiqPay`: payment checkout/callback integration

The persistence layer is now split by domain responsibility:

- `MongoDB` stores `Product` and embedded `reviews`
- `PostgreSQL` stores `User`, `Order`, `OrderItem`, `PaymentLog`, `PromoCode`, `Subscriber`, `CartItem`, `FavoriteItem`

## 2. Refactoring Goal

The refactoring goal was to move from one general-purpose MongoDB database to polyglot persistence:

### Database 1: `MongoDB`

Read-heavy catalog data:

- `Product`
- embedded `reviews`

### Database 2: `PostgreSQL`

Transactional and customer-related data:

- `User`
- `Order`
- `OrderItem`
- `PaymentLog`
- `PromoCode`
- `Subscriber`
- `CartItem`
- `FavoriteItem`

This split is reasonable for the current codebase because:

- product catalog traffic is mostly read-heavy and cacheable
- transactional data has stronger relational structure
- orders and payments benefit from explicit table relations
- the system stays simple enough for a diploma project while demonstrating architectural evolution

## 3. C4 Level 1: System Context

```mermaid
flowchart LR
    customer[Customer]
    admin[Administrator]
    teacher[Instructor / Reviewer]

    client[Web Client\nNext.js]
    api[Backend API\nExpress + TypeScript]

    liqpay[LiqPay]
    cloudinary[Cloudinary]

    customer -->|browse products, place orders| client
    admin -->|manage catalog and orders| client
    teacher -->|reviews architecture and deployment| client
    client -->|REST/JSON over HTTPS| api
    api -->|payment checkout / callback| liqpay
    api -->|image upload/storage| cloudinary
```

## 4. C4 Level 2: Container Diagram

```mermaid
flowchart LR
    customer[Customer]
    admin[Administrator]

    client[Client Container\nNext.js App Router\nReact + Tailwind]
    api[API Container\nExpress + TypeScript\nREST controllers + services]

    redis[(Redis Cache)]
    mongo[(MongoDB Catalog)]
    postgres[(PostgreSQL Commerce)]
    cloudinary[Cloudinary]
    liqpay[LiqPay]

    customer --> client
    admin --> client
    client -->|HTTP/JSON| api

    api -->|cache product lists/details| redis
    api -->|products, reviews| mongo
    api -->|users, cart, favorites,\norders, payments, promo codes,\nsubscribers| postgres
    api -->|upload product images| cloudinary
    api -->|checkout and payment status| liqpay
```

## 5. C4 Level 3: API Component Diagram

```mermaid
flowchart TD
    routes[Routes / Controllers]
    middleware[Middleware\nAuth, Validate, RateLimit,\nRequestLogger, ErrorHandler]

    userService[UserService]
    productService[ProductService]
    orderService[OrderService]
    cartService[CartService]
    favoritesService[FavoritesService]
    promoService[PromoCodeService]
    subscriberService[SubscriberService]
    cacheService[ProductCacheService]

    mongoLayer[Mongo Layer\nMongoose connection + Product model]
    postgresLayer[PostgreSQL Layer\nPrisma client + commerce models]
    redis[(Redis)]
    liqpay[LiqPay]
    cloudinary[Cloudinary]

    routes --> middleware
    routes --> userService
    routes --> productService
    routes --> orderService
    routes --> cartService
    routes --> favoritesService
    routes --> promoService
    routes --> subscriberService

    productService --> mongoLayer
    productService --> cacheService
    cacheService --> redis

    userService --> postgresLayer
    cartService --> postgresLayer
    favoritesService --> postgresLayer
    promoService --> postgresLayer
    subscriberService --> postgresLayer
    orderService --> postgresLayer
    orderService --> mongoLayer
    orderService --> liqpay
    productService --> cloudinary
```

## 6. Data Responsibility View

```mermaid
flowchart LR
    subgraph MongoDB
        product[Product]
        reviews[Embedded Reviews]
    end

    subgraph PostgreSQL
        user[User]
        cart[CartItem]
        favorites[FavoriteItem]
        order[Order]
        orderItem[OrderItem]
        payment[PaymentLog]
        promo[PromoCode]
        sub[Subscriber]
    end

    product --> reviews
    user --> cart
    user --> favorites
    user --> order
    order --> orderItem
    payment --> order
    orderItem -->|stores product id snapshot| product
```

## 7. Deployment Diagram

```mermaid
flowchart TB
    user[Browser]

    subgraph Server / VM
        subgraph Docker Network
            client[client container\nNext.js]
            api[api container\nExpress]
            mongodb[mongodb container]
            postgres[postgres container]
            redis[redis container]
        end
    end

    subgraph External Services
        cloudinary[Cloudinary]
        liqpay[LiqPay]
        ghcr[GHCR Images]
    end

    user -->|HTTPS| client
    client -->|HTTP inside app flow| api
    api --> mongodb
    api --> postgres
    api --> redis
    api --> cloudinary
    api --> liqpay
    ghcr -.deploy image pull.-> client
    ghcr -.deploy image pull.-> api
```

## 8. Practical Refactoring Plan

Implemented direction:

1. Keep the application as one API service.
2. Move catalog persistence to a dedicated MongoDB connection.
3. Introduce PostgreSQL with Prisma for commerce data.
4. Move users, cart, favorites, orders, payment logs, promo codes, and subscribers into PostgreSQL.
5. Keep cross-database links explicit by storing product snapshots and product ids in order items.

## 9. What to Tell the Instructor

You can describe the refactoring like this:

> The project remains a modular monolith, but its persistence layer was refactored to polyglot persistence. MongoDB is used for the product catalog because it fits document-oriented catalog data, while PostgreSQL is used for users, orders, payments, carts, and promo codes because those parts benefit from a relational model.

## 10. Notes for the Thesis / Explanatory Report

Good points to mention in the report:

- why C4 was chosen: multiple abstraction levels and better communication
- why the system remains a monolith: lower operational complexity
- why MongoDB stays for catalog data: flexible product documents and review embedding
- why PostgreSQL was introduced: stronger relational model for commerce workflows
- why Redis stays separate: it is a cache, not a source of truth
