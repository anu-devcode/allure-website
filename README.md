# Allure Online Shopping

A premium, elegant e-commerce platform designed for modern social-media active buyers. 

This repository contains both the frontend and backend applications for the Allure Shopping experience.

## Project Structure

```text
allure-website/
├── allure-frontend/    # Next.js 15 Frontend
└── allure-backend/     # Node.js/Express + Prisma Backend
```

## Features

- **Dynamic Catalog:** Browse products with advanced filtering and real-time availability.
- **Custom Pre-orders:** Dedicated flow for requesting items from SHEIN or Turkey.
- **Premium UX:** High-fidelity UI with smooth animations and glassmorphism aesthetics.
- **Manual Payment Flow:** Seamless integration with local payment methods (Telebirr, CBE, Cash on Delivery).
- **Admin Dashboard:** Full control over products, orders, and content.

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (database)
- npm or yarn

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/allure-website.git
   cd allure-website
   ```

2. **Backend Configuration:**
   - Go to `allure-backend/`.
   - Copy `.env.example` to `.env` and fill in your database and JWT details.
   - Run `npm install`.
   - Run `npx prisma generate` and `npx prisma migrate dev`.
   - Start with `npm run dev`.

3. **Frontend Configuration:**
   - Go to `allure-frontend/`.
   - Run `npm install`.
   - Setup `.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:5000/api`.
   - Start with `npm run dev`.

## Tech Stack

- **Frontend:** Next.js 15, Tailwind CSS 4, Zustand, Lucide React.
- **Backend:** Node.js, Express, Prisma ORM, PostgreSQL.
- **Payments:** Manual Verification (Telebirr, CBE).
