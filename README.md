# 📱 PixelMart | Premium Google Pixel Store & Hub

PixelMart is a production-grade, highly polished, full-stack e-commerce application specializing in authentic, factory-sealed **Google Pixel devices, Pixel Watch wearables, and premium Google smart accessories**. 

This application is built with a desktop-first responsive design, modern **React 18**, **TypeScript**, and a robust **Express 4 backend**. It offers dual-mode capability: seamlessly operating on **MongoDB Atlas** or failing over automatically to an in-memory/JSON flat-file fallback (`local-db.json`) for effortless, zero-config previews.

---

## 🚀 Key Production Features

*   **⚡ Modern Architecture**: Client-side React SPA with Vite, featuring 100% route-level lazy loading and `Suspense` skeletons for near-instant first-contentful paint.
*   **💳 Cashfree PG Integration**: Real-time order generation and secure Cashfree JS v3 checkout. Features fallback mock sandbox payment simulation for local testing when credentials are omitted.
*   **🛡️ Secure Inputs**: Centralized input sanitization (XSS filtering), field trim-guards, and strict schema validation for user registry, contact entries, and reviews.
*   **🔒 Robust Authentication**: JWT-based session security with cryptographically hashed passwords via `bcryptjs`.
*   **🔧 Complete Admin Console**: Integrated dashboard allowing real-time inventory adjustments, stock increments, product additions, base64 image uploads, and order dispatch status cycles.
*   **💬 Responsive Reviews**: Dynamic customer star rating and comment sections with verified-purchaser lockouts.
*   **🏷️ Intelligent Promotions**: Dynamic discount calculations supporting promo coupons (e.g., `PIXEL10` for 10% off, `WELCOME50` for flat $50.00 off, `FREESHIP`).

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion (animations), Lucide React (icons) |
| **Backend** | Node.js, Express.js, TypeScript, JWT, BcryptJS |
| **Database** | MongoDB Atlas / Mongoose (Cloud) & local JSON fallback (Offline) |
| **Payments** | Cashfree PG (v3 SDK) |

---

## 📡 Backend API Documentation

### 🔑 Authentication (`/api/users`)
*   `POST /api/users/register` - Registers a new user. Performs email format validation and password length checks.
*   `POST /api/users/login` - Authenticates user credentials and returns a secure JWT.
*   `GET /api/users/me` - Retrieves the authenticated user's profile details. *(Auth Header Required)*

### 📦 Products (`/api/products`)
*   `GET /api/products` - Returns list of all products in the catalog.
*   `GET /api/products/:id` - Fetches specific product specifications, stock status, and details.
*   `POST /api/products` - Creates a new product. *(Admin Only)*
*   `PUT /api/products/:id` - Updates product name, stock, description, or pricing. *(Admin Only)*
*   `DELETE /api/products/:id` - Deletes product from database. *(Admin Only)*

### 💳 Orders & Payments (`/api/orders`)
*   `POST /api/orders` - Direct checkout route for guest or logged-in users (supports inventory deduction).
*   `GET /api/orders/user` - Fetches order history for logged-in user. *(Auth Header Required)*
*   `GET /api/orders` - Lists all placed orders. *(Admin Only)*
*   `PUT /api/orders/:id/status` - Updates dispatch lifecycle (`placed`, `processing`, `dispatched`, `delivered`). *(Admin Only)*
*   `POST /api/orders/cashfree-session` - Generates an active transaction session with Cashfree PG. Falls back to simulated sandbox checkout if secrets are absent.
*   `POST /api/orders/cashfree-verify` - Securely queries transaction state from Cashfree nodes.
*   `POST /api/orders/cashfree-webhook` - Server-to-server webhook callback listener for asynchronous transaction notifications.

### 💬 Reviews (`/api/reviews`)
*   `GET /api/reviews/:productId` - Retrieves all customer feedback, ratings, and timestamps.
*   `POST /api/reviews` - Posts a new review. Restricted to authenticated users who have verified purchases of the target product.

### 📬 Support (`/api/contact`)
*   `POST /api/contact` - Captures general customer inquiries, validates inputs, and triggers simulated mail server logs on stdout.

---

## 📦 Setting Up the Workspace

### 1. Configure the Environment
Clone `.env.example` into a local `.env` file and define the configuration values:

```env
# JWT Session Security Key
JWT_SECRET="generate_a_long_random_hash_string_here"

# MongoDB Database Connection
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.k4p7xai.mongodb.net/pixelmart"

# [Optional] Secure Bootstrapper Admin Email (automatically promoted on startup or registration)
INITIAL_ADMIN_EMAIL="pankesh2008@gmail.com"

# Cashfree Payments configurations (Leave empty to use the built-in sandbox simulator)
CASHFREE_CLIENT_ID=""
CASHFREE_CLIENT_SECRET=""
CASHFREE_MODE="sandbox"

# APP ROOT URL
APP_URL="http://localhost:3000"
```

### 2. Install Workspace Dependencies
Execute the command to download and compile all packages:
```bash
npm install
```

### 3. Launch Development Server
Starts the Express routing engine and binds Vite development middleware:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Compiling Production Bundle
Compiles the static client React bundle into optimized, chunks in `dist/` and compiles the TypeScript server code into `dist/server.cjs`:
```bash
npm run build
```

---

## 🏗️ Architecture Design

```
                     ┌───────────────────┐
                     │   Web Browser     │
                     └─────────┬─────────┘
                               │
                Sends HTTP Requests / Loads Assets
                               │
                               ▼
                    ┌─────────────────────┐
                    │    Express App      │ (Port 3000)
                    └──────────┬──────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
 ┌─────────────────────┐               ┌─────────────────────┐
 │    MongoDB Atlas    │               │  Flat JSON Fallback │
 │  (Mongoose Models)  │               │   (local-db.json)   │
 └─────────────────────┘               └─────────────────────┘
```

When started, PixelMart runs an environment-level auto-check:
1. If **MongoDB Atlas** credentials are set in the `.env` file, the Mongoose client links up. It validates the product catalog collection size; if empty, it triggers an auto-seeding routine loading high-quality product images, colors, variants, and specifications.
2. If credentials are missing, the server outputs a clean fallback notice and activates `local-db.ts` to coordinate reading/writing orders, reviews, users, and contact logs directly to `/server/local-db.json`. 
3. This architecture guarantees that **100% of the application features work seamlessly right out of the box** without any complex prerequisite cloud configuration.
