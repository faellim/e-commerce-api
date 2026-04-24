# E-commerce API

## Demo

![System demo](assets/demo/ecommerce-demo.gif)

Full-stack e-commerce project built with FastAPI, PostgreSQL, React, and Vite. It includes JWT authentication, product management, shopping cart, checkout flow, stock control, automated tests, CI, and deployment-ready configuration.

## Live Links

- Frontend: [https://e-commerce-api-beta-eight.vercel.app](https://e-commerce-api-beta-eight.vercel.app)
- Backend API: [https://ecommerce-api-z4q0.onrender.com](https://ecommerce-api-z4q0.onrender.com)
- Swagger Docs: [https://ecommerce-api-z4q0.onrender.com/docs](https://ecommerce-api-z4q0.onrender.com/docs)

## Features

- JWT authentication with register, login, and current-user endpoints
- Role-based access with admin-only product management
- Product catalog with search support
- Shopping cart per user
- Checkout flow with automatic stock reduction
- Order history for customers
- Order listing for admins
- React frontend connected to the API
- Automated tests with `pytest`
- GitHub Actions CI pipeline
- Deployment setup for Render and Vercel

## Tech Stack

- Backend: Python, FastAPI, SQLAlchemy, Pydantic Settings, Passlib, Python-JOSE
- Database: PostgreSQL
- Frontend: React, Vite
- Testing: Pytest, HTTPX
- DevOps: Docker, Docker Compose, GitHub Actions, Render, Vercel

## Project Structure

```text
app/
  api/
  core/
  models/
  schemas/
frontend/
tests/
assets/demo/
scripts/demo/
```

## API Overview

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

### Products

- `GET /api/v1/products`
- `GET /api/v1/products/{product_id}`
- `POST /api/v1/products`
- `PUT /api/v1/products/{product_id}`
- `DELETE /api/v1/products/{product_id}`

### Cart

- `GET /api/v1/cart`
- `POST /api/v1/cart/items`
- `PUT /api/v1/cart/items/{product_id}`
- `DELETE /api/v1/cart/items/{product_id}`

### Orders

- `POST /api/v1/orders/checkout`
- `GET /api/v1/orders/mine`
- `GET /api/v1/orders/{order_id}`
- `GET /api/v1/orders`

## Business Rules

- The first registered user becomes `admin`
- Only admins can create, update, and delete products
- Products require a unique `sku`
- Checkout fails if stock is insufficient
- Successful checkout creates an order and reduces product stock

## Running Locally

### Backend

1. Install dependencies:

```powershell
pip install -r requirements.txt
```

2. Copy the environment file:

```powershell
Copy-Item .env.example .env
```

3. Start with Docker:

```powershell
docker compose up --build
```

4. Open:

- API: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`
- Healthcheck: `http://localhost:8000/health`

### Frontend

1. Move to the frontend folder:

```powershell
cd frontend
```

2. Copy the environment file:

```powershell
Copy-Item .env.example .env
```

3. Install dependencies:

```powershell
npm.cmd install
```

4. Start the dev server:

```powershell
npm.cmd run dev
```

5. Open:

- Frontend: `http://localhost:5173`

## Testing

Run backend tests:

```powershell
pytest
```

Current automated coverage includes:

- healthcheck
- register and login flow
- checkout with stock reduction

Build the frontend:

```powershell
cd frontend
npm.cmd run build
```

## Deployment

### Backend on Render

This repository includes a `render.yaml` blueprint that provisions:

- one web service for the FastAPI backend
- one managed PostgreSQL database

### Frontend on Vercel

The frontend lives in `frontend/` and is ready to deploy on Vercel.

Required environment variable:

```env
VITE_API_BASE_URL=https://your-backend.onrender.com
```

If you want to restrict CORS in production, set this on Render:

```env
BACKEND_CORS_ORIGINS=["https://your-frontend.vercel.app"]
```

## Environment Variables

Example backend configuration:

```env
APP_NAME=E-commerce API
APP_VERSION=1.0.0
DEBUG=true
ENVIRONMENT=development
SECRET_KEY=change-this-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
BACKEND_CORS_ORIGINS=["*"]
DATABASE_URL=postgresql://postgres:postgres@db:5432/ecommerce_db
```

Frontend example:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Demo Flow

1. Register the first user to create an admin account
2. Login as admin
3. Create one or more products
4. Register a customer account
5. Add a product to cart
6. Complete checkout
7. Review created orders

## Possible Improvements

- Pagination and advanced filters
- Product image upload
- Alembic migrations
- Payment gateway integration
- More test coverage
- Admin dashboard analytics

## Repository Notes

- Demo GIF is stored in `assets/demo/ecommerce-demo.gif`
- Capture scripts used to generate the demo are stored in `scripts/demo/`
