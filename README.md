# Nutrition Counselling Web Application (MERN Stack)

A full MERN stack application for nutrition counselling: user signup with detailed health/dietary profiling, BMI tracking with trend graphs and auto-generated insights, an AI nutrition chatbot (OpenRouter), appointment booking, a nutrition articles hub, standalone calculator tools, and a role-based admin dashboard.

## Project Structure

```
nutrition-app/
├── backend/     Node.js + Express + MongoDB API
└── frontend/    React + Vite + Tailwind CSS SPA
```

## Getting Started

### 1. Backend

```bash
cd backend
cp .env.example .env      # then fill in your MONGO_URI, JWT_SECRET, OPENROUTER_API_KEY, SMTP settings
npm install
npm run seed:admin        # creates the first admin account (uses ADMIN_EMAIL/ADMIN_PASSWORD from .env)
npm run dev                # starts on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                # starts on http://localhost:5173, proxies /api to the backend
```

Open http://localhost:5173, sign up as a client, or log in with the seeded admin account to access `/admin`.

## Key Environment Variables (backend/.env)

| Variable | Purpose |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret used to sign JWTs |
| `CLIENT_URL` | Frontend origin, used for CORS and password-reset links |
| `OPENROUTER_API_KEY` | Powers the AI nutrition chatbot |
| `SMTP_*` / `EMAIL_FROM` | Used to send "forgot password" emails via Nodemailer |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Used only by `npm run seed:admin` |

## Notable Design Decisions

- **Role-based access is enforced server-side** (`middleware/authMiddleware.js` → `authorize('admin')`), not just hidden in the UI. All `/api/admin/*` and shop-management routes require a valid JWT **and** the `admin` role.
- **BMI history** is a separate collection (`BmiRecord`) so every weight update preserves a historical trend, powering the dashboard chart and the auto-generated insight text.
- **Appointments store a snapshot** of the user's key stats (name, age, BMI, etc.) at time of booking, so historical appointments remain accurate even if the user's profile changes later.
- **Tools calculators are stateless** — the "Tools" BMI/water/calorie calculators never touch the database, per the spec.
- **The chatbot system prompt is rebuilt server-side on every request** from the authenticated user's live profile (age, BMI, dietary habits, lifestyle, etc.), and is explicitly instructed not to diagnose or prescribe medication.
- **Security**: bcrypt password hashing, JWT auth, Helmet, CORS allow-list, general + auth + chatbot rate limiting, and centralized error handling that never leaks stack traces in production.

## Shop Module

A full e-commerce module for nutritional supplements, built as a natural extension of the app rather than a bolt-on:

- **Only reachable via the Footer** (`Shop` link) — intentionally excluded from the main sidebar/bottom nav per spec. A small cart icon (with live item count) is shown in the header for quick access once items are added.
- **Storefront**: hero banner, featured/new-arrival/best-seller rails, category/brand/price filters, search with autocomplete suggestions, sorting, pagination, loading skeletons, and empty states (`pages/shop/ShopHome.jsx`).
- **Product detail**: full gallery, tabs (description/ingredients/nutrition facts/usage & warnings/reviews), related products, wishlist, social share, and a review form (pending admin approval before it's public).
- **Cart & Checkout**: cart persists in `localStorage` (`context/CartContext.jsx`) so it survives refreshes without requiring login just to browse; checkout collects delivery/payment info and creates a real `Order` document, with **all pricing (subtotal, discount, shipping, total) revalidated server-side** against live product prices and stock — the client-side numbers shown are only an estimate.
- **Orders**: order history, printable invoice-style detail page, and a one-click "Reorder" that re-adds all items to the cart.
- **Admin → Shop Management**: a dedicated section (separate from the main admin nav) covering a dashboard (revenue, low/out-of-stock, best sellers, latest orders, recent reviews), full product CRUD with bulk publish/hide/delete/duplicate and image uploads (thumbnail + gallery), category/brand management, order status updates, and review moderation (approve/hide/delete/reply).
- **Image uploads** are handled via `multer` to local disk storage (`backend/uploads/`), served statically at `/uploads/...`. This is fine for development and small deployments, but **note**: Render's filesystem is ephemeral — uploaded images will be lost on redeploy/restart. For production, swap `middleware/uploadMiddleware.js` to upload to a persistent store (Cloudinary, S3, etc.) instead of local disk.
- **Coupons**: simple percent/fixed-amount codes with expiry and usage limits, validated both at cart-preview time and re-validated at order creation.

## Deployment

- **Frontend** → Vercel (`npm run build`, output in `frontend/dist`)
- **Backend** → Render (Node web service, start command `npm start`)
- **Database** → MongoDB Atlas

Remember to set `CLIENT_URL` on the backend to your deployed frontend URL, and point the frontend's API calls at your deployed backend URL if you're not using the Vite dev proxy (see `frontend/.env.example`).
