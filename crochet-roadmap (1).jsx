import { useState } from "react";

const phases = [
  {
    id: 1, emoji: "🗺️", title: "Planning & Setup", days: "Day 1", color: "#e8b4b8", accent: "#c47c82",
    tasks: [
      { title: "Define Your Project Scope", why: "Without a clear plan, you'll waste days rebuilding things. A blueprint saves time.", what: "List all pages (Home, Shop, Product Detail, Cart, Checkout, Admin). Sketch wireframes on paper or Excalidraw.", output: "A rough wireframe / page list document", beginner: "Don't overthink. Even a rough sketch in a notebook is enough!" },
      { title: "Setup Developer Accounts", why: "You need these tools before writing a single line of code.", what: "Create accounts: GitHub, Firebase, Vercel, Render, Razorpay (test mode). Install: Node.js, Python 3.11+, VS Code, Git.", output: "All accounts ready, tools installed", beginner: "Use your college email for free tiers on most platforms." },
      { title: "Initialize Git Repository", why: "Version control = your safety net. Commit early, commit often.", what: "Create a GitHub repo. Inside it, create two folders: /frontend and /backend. Add a README.", output: "GitHub repo with folder structure committed", beginner: "Rule of thumb: commit after every feature, not at the end of the day." }
    ],
    miniGoal: "You have a plan, all tools installed, and a GitHub repo ready to go.",
    mistakes: ["Skipping wireframes and jumping to code — you'll refactor 3x more", "Not using Git from Day 1 — you WILL lose code", "Overthinking the design — keep it simple and functional first"]
  },
  {
    id: 2, emoji: "⚛️", title: "Frontend Development", days: "Days 2–5", color: "#b4d4e8", accent: "#4a90c4",
    tasks: [
      { title: "Project Structure & Routing", why: "A clean folder structure makes your code readable and maintainable.", what: "Run: npm create vite@latest frontend -- --template react\nInstall: react-router-dom, axios, tailwindcss\nCreate folders: /components, /pages, /hooks, /context, /utils\nSetup React Router with pages: Home, Shop, ProductDetail, Cart, Checkout", output: "App runs on localhost:5173 with working routes", beginner: "Think of routes like pages in a book — each URL = one page." },
      { title: "Build Core Pages", why: "Users interact with these pages most. Get them right first.", what: "Home: Hero banner + featured products grid\nShop: Product cards with filter by category\nProductDetail: Image, description, Add to Cart button\nCart: Items list, quantity controls, total price", output: "4 pages with static/mock data working and styled", beginner: "Use hardcoded data first (fake products array). Connect real data later." },
      { title: "Cart & State Management", why: "Cart state needs to persist across pages — this is where React Context shines.", what: "Create CartContext with useReducer. Actions: ADD_ITEM, REMOVE_ITEM, UPDATE_QTY, CLEAR_CART. Wrap App in CartProvider.", output: "Add to cart works, cart icon shows count, cart page shows items", beginner: "useContext + useReducer = lightweight Redux. Perfect for this project size." },
      { title: "Responsive Design & Polish", why: "60%+ of shoppers use mobile. A non-responsive site loses sales.", what: "Use Tailwind responsive prefixes (sm:, md:, lg:). Test on Chrome DevTools mobile view. Add loading skeletons for product cards.", output: "Site looks great on mobile and desktop", beginner: "Design mobile-first: build for small screens, then scale up." }
    ],
    miniGoal: "Full React frontend with routing, cart state, and responsive design — all with mock data.",
    mistakes: ["Putting API calls directly in components — use custom hooks instead", "Not using keys in .map() — React will warn you and bugs appear", "Styling everything inline — use Tailwind classes or a CSS file", "Forgetting mobile view until the end — design mobile-first from day 1"],
    structure: { title: "Frontend Folder Structure", code: `frontend/\n├── src/\n│   ├── components/\n│   │   ├── Navbar.jsx\n│   │   ├── ProductCard.jsx\n│   │   ├── CartItem.jsx\n│   │   └── Footer.jsx\n│   ├── pages/\n│   │   ├── Home.jsx\n│   │   ├── Shop.jsx\n│   │   ├── ProductDetail.jsx\n│   │   ├── Cart.jsx\n│   │   └── Checkout.jsx\n│   ├── context/\n│   │   └── CartContext.jsx\n│   ├── hooks/\n│   │   └── useProducts.js\n│   ├── utils/\n│   │   └── formatPrice.js\n│   ├── App.jsx\n│   └── main.jsx\n├── public/\n├── index.html\n└── package.json` }
  },
  {
    id: 3, emoji: "⚡", title: "Backend Development", days: "Days 6–8", color: "#b4e8c4", accent: "#2e9e56",
    tasks: [
      { title: "FastAPI Project Setup", why: "FastAPI is fast, modern, and gives you automatic API docs — perfect for interviews.", what: "cd backend\npython -m venv venv\nsource venv/bin/activate\npip install fastapi uvicorn python-dotenv firebase-admin\nCreate: main.py, routers/, models/, config/", output: "FastAPI running on localhost:8000, /docs page works", beginner: "The /docs page (Swagger UI) auto-generates from your code. Show this in interviews!" },
      { title: "Build REST API Endpoints", why: "Your frontend needs these endpoints to fetch and send data.", what: "GET /products — list all products\nGET /products/{id} — single product\nPOST /orders — create new order\nGET /orders/{id} — get order status\nGET /categories — list categories", output: "All endpoints testable via /docs with correct responses", beginner: "Test every endpoint in /docs before connecting to frontend. Fix backend first!" },
      { title: "CORS & Environment Config", why: "Without CORS, your React app cannot talk to FastAPI. This trips up every beginner.", what: "Add CORSMiddleware in main.py. Allow origins: ['http://localhost:5173']. Store secrets in .env file. NEVER commit .env to GitHub.", output: "Frontend can call backend without CORS errors", beginner: "Add .env to .gitignore immediately. One mistake here can expose API keys publicly." }
    ],
    miniGoal: "FastAPI running with all endpoints. Swagger docs at /docs. Frontend can call APIs.",
    mistakes: ["Forgetting to activate the virtual environment — packages won't install correctly", "Committing .env files to GitHub — CRITICAL mistake, can expose secret keys", "Not handling errors — always return proper HTTP status codes (404, 400, 500)", "Hardcoding localhost URLs — use environment variables for all URLs"],
    structure: { title: "Backend Folder Structure", code: `backend/\n├── main.py\n├── routers/\n│   ├── products.py\n│   ├── orders.py\n│   └── payments.py\n├── models/\n│   └── schemas.py\n├── config/\n│   └── firebase.py\n├── .env\n├── .gitignore\n└── requirements.txt` }
  },
  {
    id: 4, emoji: "🔥", title: "Firebase Firestore", days: "Day 9", color: "#f5d9a0", accent: "#e07b00",
    tasks: [
      { title: "Firebase Setup & Admin SDK", why: "Firestore is a NoSQL cloud database. No SQL knowledge needed — perfect for beginners.", what: "Create Firebase project. Enable Firestore. Download serviceAccountKey.json. Initialize firebase-admin in FastAPI config/firebase.py. Add serviceAccountKey.json to .gitignore!", output: "FastAPI can read/write to Firestore", beginner: "Think of Firestore as a giant JSON object in the cloud." },
      { title: "Design Firestore Collections", why: "Good data structure = fast queries and easy code. Plan before you build.", what: "Collections: products (id, name, price, images, category, stock), orders (id, items, total, status, userId, createdAt), users (id, email, address)", output: "Collections created in Firebase Console with sample data", beginner: "Firestore collections = SQL tables. Documents = rows. Fields = columns." },
      { title: "CRUD Operations in FastAPI", why: "Your API endpoints now need real data instead of hardcoded values.", what: "Replace mock data with Firestore queries. Add product to Firestore, fetch all, fetch by ID. Create order on checkout. Update order status after payment.", output: "Frontend shows real products from Firestore database", beginner: "Test in Postman or /docs after every change. Don't connect frontend until backend works." }
    ],
    miniGoal: "Products stored in Firestore. FastAPI reads/writes real data. Frontend shows live products.",
    mistakes: ["Committing serviceAccountKey.json — this gives anyone full database access!", "Not indexing queries — Firestore will warn you, add indexes in Firebase Console", "Fetching entire collections when you need 5 items — always use .limit()", "No security rules in Firestore — set rules before going live"]
  },
  {
    id: 5, emoji: "💳", title: "Razorpay Payments", days: "Day 10", color: "#d4b4e8", accent: "#7c4ac4",
    tasks: [
      { title: "Razorpay Test Mode Setup", why: "Payments are the most sensitive part. Always build and test in sandbox mode first.", what: "Get test API keys from Razorpay Dashboard. pip install razorpay in backend. Store Key ID and Key Secret in .env. NEVER expose Secret Key to frontend.", output: "Razorpay SDK connected to backend", beginner: "Test cards/UPI IDs are provided by Razorpay. Use them — no real money involved." },
      { title: "Payment Flow Implementation", why: "Razorpay requires a specific flow: backend creates order → frontend opens checkout → backend verifies payment.", what: "Backend: POST /payment/create-order — creates Razorpay order, returns order_id\nFrontend: Load Razorpay script, open checkout with order_id\nBackend: POST /payment/verify — verify payment signature (HMAC)\nUpdate Firestore order status to 'paid'", output: "Test UPI payment works end-to-end in test mode", beginner: "ALWAYS verify payment on the backend. Never trust frontend payment confirmation." },
      { title: "Order Confirmation Page", why: "Users need confirmation. It also helps you track successful orders.", what: "After successful payment, redirect to /order-success?id={orderId}. Show order summary, estimated delivery. Send data to Firestore with status='paid'.", output: "Order success page shows after test payment", beginner: "Handle payment failure too — show a user-friendly error and retry option." }
    ],
    miniGoal: "Complete payment flow working in test mode. Orders saved to Firestore with correct status.",
    mistakes: ["Putting Razorpay Secret Key in frontend code — it will be visible to everyone!", "Not verifying payment signature — anyone can fake a payment without this", "No error handling for failed payments — always handle the failure case", "Forgetting to switch to live keys before launch — test keys don't process real money"]
  },
  {
    id: 6, emoji: "🚀", title: "Deployment", days: "Days 11–12", color: "#b4c4e8", accent: "#2d4ec4",
    tasks: [
      { title: "Deploy Frontend to Vercel", why: "Vercel is the easiest way to deploy React apps with automatic SSL and CDN.", what: "Push frontend to GitHub. Connect repo to Vercel. Set environment variables: VITE_API_URL=your-render-url. Deploy. Every git push auto-deploys.", output: "Frontend live at yourapp.vercel.app", beginner: "Vercel reads your VITE_ env variables automatically. Prefix all frontend env vars with VITE_." },
      { title: "Deploy Backend to Render", why: "Render offers free FastAPI hosting with auto-deploy from GitHub.", what: "Create requirements.txt: pip freeze > requirements.txt. On Render: New Web Service → Connect GitHub → Build Command: pip install -r requirements.txt → Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT. Add all .env variables in Render dashboard.", output: "Backend live at yourapp.onrender.com/docs", beginner: "Render free tier sleeps after 15 mins of inactivity. First request may be slow — this is normal." },
      { title: "Connect & Test Everything", why: "Local tests pass does not equal production works. Always test the deployed version.", what: "Update VITE_API_URL to Render URL in Vercel. Update CORS in FastAPI to allow Vercel domain. Test full flow: browse → add to cart → checkout → pay. Fix any production bugs.", output: "Full app working on live URLs end-to-end", beginner: "Open browser DevTools → Network tab. Any red requests show you what's broken." }
    ],
    miniGoal: "Fully deployed app. Frontend on Vercel, backend on Render, database on Firebase. Live URL ready.",
    mistakes: ["Forgetting to update CORS for production domain — frontend will get blocked", "Not setting environment variables on Render/Vercel — app will crash with 'undefined' errors", "Committing requirements.txt without virtual env active — wrong packages listed", "Using localhost URLs in production code — always use environment variables"]
  },
  {
    id: 7, emoji: "✅", title: "Testing & Polish", days: "Days 13–14", color: "#e8d4b4", accent: "#c47c00",
    tasks: [
      { title: "Manual End-to-End Testing", why: "You need to find bugs before your users do.", what: "Test every user journey: Browse → Filter → View Product → Add to Cart → Checkout → Pay → Confirmation. Test on mobile. Test slow internet (Chrome DevTools → Network → Slow 3G). Test with empty cart, out of stock items.", output: "Bug list documented and fixed", beginner: "Share the link with a friend and watch them use it without guidance. Their confusion = your bugs." },
      { title: "Performance & SEO Basics", why: "A fast site ranks better on Google and keeps users from leaving.", what: "Compress images (use WebP format). Add meta tags in index.html. Add loading states everywhere. Run Lighthouse in Chrome DevTools. Target 80+ score.", output: "Lighthouse score 80+, images optimized", beginner: "Lighthouse is free, built into Chrome. Press F12 → Lighthouse tab → Generate report." },
      { title: "Resume & Portfolio Prep", why: "This project is your biggest interview asset. Present it confidently.", what: "Take screenshots: Homepage, Shop, Product page, Cart, Payment flow, Order confirmation, Firebase console, Swagger /docs. Write a README with: project description, tech stack, live link, setup instructions, screenshots. Record a 2-min demo video.", output: "GitHub README polished, screenshots taken, demo video recorded", beginner: "Interviewers look at your GitHub README before they look at your code." }
    ],
    miniGoal: "Bug-free app, polished README, screenshots taken, demo video ready. You're interview-ready!",
    mistakes: ["Skipping testing — bugs in demos are embarrassing and avoidable", "A poor README — recruiters judge projects by README quality", "Not having a demo video — many recruiters won't run code locally", "Forgetting to make GitHub repo public before sharing"]
  }
];

const jsonSchemas = [
  {
    module: "Product", emoji: "🧶", color: "#e8b4b8", accent: "#c47c82",
    collection: "Firestore → products",
    description: "Represents a single crochet product for sale in the shop.",
    fields: [
      { key: "id", type: "string", desc: "Auto-generated Firestore document ID (e.g. 'prod_abc123')" },
      { key: "name", type: "string", desc: "Product display name (e.g. 'Amigurumi Bear')" },
      { key: "slug", type: "string", desc: "URL-friendly version of name (e.g. 'amigurumi-bear')" },
      { key: "description", type: "string", desc: "Full product description shown on product page" },
      { key: "price", type: "number", desc: "Price in Indian Rupees (e.g. 450)" },
      { key: "compare_price", type: "number | null", desc: "Original price if on sale, else null (e.g. 600)" },
      { key: "category", type: "string", desc: "'amigurumi' | 'home-decor' | 'accessories' | 'bags'" },
      { key: "tags", type: "string[]", desc: "Search/filter tags (e.g. ['handmade', 'gift', 'cotton'])" },
      { key: "images", type: "string[]", desc: "Array of Firebase Storage image URLs" },
      { key: "stock", type: "number", desc: "Quantity available. 0 = out of stock" },
      { key: "is_featured", type: "boolean", desc: "If true, shown on homepage featured section" },
      { key: "is_active", type: "boolean", desc: "If false, hidden from shop (soft delete)" },
      { key: "weight_grams", type: "number", desc: "Weight for shipping fee calculation" },
      { key: "created_at", type: "timestamp", desc: "Firestore server timestamp when created" },
      { key: "updated_at", type: "timestamp", desc: "Last modified timestamp" },
    ],
    example: `{
  "id": "prod_bear_001",
  "name": "Amigurumi Bear",
  "slug": "amigurumi-bear",
  "description": "Handcrafted crochet teddy bear made with 100% cotton yarn. Perfect gift for babies and kids.",
  "price": 450,
  "compare_price": 600,
  "category": "amigurumi",
  "tags": ["handmade", "gift", "cotton", "baby"],
  "images": [
    "https://storage.googleapis.com/.../bear-front.webp",
    "https://storage.googleapis.com/.../bear-side.webp"
  ],
  "stock": 12,
  "is_featured": true,
  "is_active": true,
  "weight_grams": 150,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-20T08:00:00Z"
}`
  },
  {
    module: "Category", emoji: "🏷️", color: "#b4d4e8", accent: "#4a90c4",
    collection: "Firestore → categories",
    description: "Product categories used for filtering in the Shop page.",
    fields: [
      { key: "id", type: "string", desc: "Firestore document ID (e.g. 'cat_amigurumi')" },
      { key: "name", type: "string", desc: "Display name shown in navigation (e.g. 'Amigurumi')" },
      { key: "slug", type: "string", desc: "URL slug matching product.category field" },
      { key: "description", type: "string", desc: "Short description shown on category page" },
      { key: "image_url", type: "string", desc: "Category banner/thumbnail image URL" },
      { key: "product_count", type: "number", desc: "Total active products in this category (update on product add/remove)" },
      { key: "sort_order", type: "number", desc: "Controls display order in nav. 1 = first" },
      { key: "is_active", type: "boolean", desc: "Hide/show category in navigation" },
    ],
    example: `{
  "id": "cat_amigurumi",
  "name": "Amigurumi",
  "slug": "amigurumi",
  "description": "Cute crocheted stuffed animals and dolls",
  "image_url": "https://storage.googleapis.com/.../amigurumi-banner.webp",
  "product_count": 8,
  "sort_order": 1,
  "is_active": true
}`
  },
  {
    module: "User", emoji: "👤", color: "#b4e8c4", accent: "#2e9e56",
    collection: "Firestore → users",
    description: "Customer account data. Created when user registers or places first order.",
    fields: [
      { key: "id", type: "string", desc: "Firebase Auth UID — same as auth.currentUser.uid" },
      { key: "email", type: "string", desc: "User's email address from Firebase Auth" },
      { key: "name", type: "string", desc: "Full name entered during signup" },
      { key: "phone", type: "string", desc: "Indian mobile number with country code (e.g. '+919876543210')" },
      { key: "avatar_url", type: "string | null", desc: "Profile picture URL, null if not set" },
      { key: "address.line1", type: "string", desc: "House/flat/street address" },
      { key: "address.line2", type: "string | null", desc: "Area, landmark (optional)" },
      { key: "address.city", type: "string", desc: "City (e.g. 'Kollam')" },
      { key: "address.state", type: "string", desc: "State (e.g. 'Kerala')" },
      { key: "address.pincode", type: "string", desc: "6-digit Indian PIN code" },
      { key: "address.country", type: "string", desc: "Default: 'India'" },
      { key: "order_count", type: "number", desc: "Total orders placed. Increment after each order." },
      { key: "created_at", type: "timestamp", desc: "Account creation time" },
      { key: "last_login", type: "timestamp", desc: "Last login timestamp (update on each login)" },
    ],
    example: `{
  "id": "uid_firebase_abc123",
  "email": "priya@example.com",
  "name": "Priya Nair",
  "phone": "+919876543210",
  "avatar_url": null,
  "address": {
    "line1": "42, MG Road",
    "line2": "Near Collectorate",
    "city": "Kollam",
    "state": "Kerala",
    "pincode": "691001",
    "country": "India"
  },
  "order_count": 3,
  "created_at": "2024-01-10T09:00:00Z",
  "last_login": "2024-01-22T14:30:00Z"
}`
  },
  {
    module: "Cart", emoji: "🛒", color: "#f5d9a0", accent: "#e07b00",
    collection: "React Context (in-memory) — not stored in Firestore",
    description: "Cart lives in React Context using useReducer. Sent to backend only at checkout. Optionally persist to localStorage.",
    fields: [
      { key: "items", type: "CartItem[]", desc: "Array of all products added to cart" },
      { key: "items[].product_id", type: "string", desc: "Firestore product document ID" },
      { key: "items[].name", type: "string", desc: "Product name (copy from product for display)" },
      { key: "items[].image_url", type: "string", desc: "First image URL from product.images array" },
      { key: "items[].price", type: "number", desc: "Price at time of adding to cart (locked)" },
      { key: "items[].quantity", type: "number", desc: "How many units. Min: 1" },
      { key: "items[].subtotal", type: "number", desc: "price × quantity — compute this in reducer" },
      { key: "total_items", type: "number", desc: "Sum of all item quantities (shown in cart badge)" },
      { key: "total_price", type: "number", desc: "Sum of all subtotals (shown at checkout)" },
      { key: "coupon_code", type: "string | null", desc: "Applied discount code, null if none" },
      { key: "discount", type: "number", desc: "Discount amount in rupees. 0 if no coupon." },
    ],
    example: `{
  "items": [
    {
      "product_id": "prod_bear_001",
      "name": "Amigurumi Bear",
      "image_url": "https://storage.googleapis.com/.../bear-front.webp",
      "price": 450,
      "quantity": 2,
      "subtotal": 900
    },
    {
      "product_id": "prod_tote_002",
      "name": "Crochet Tote Bag",
      "image_url": "https://storage.googleapis.com/.../tote-front.webp",
      "price": 650,
      "quantity": 1,
      "subtotal": 650
    }
  ],
  "total_items": 3,
  "total_price": 1550,
  "coupon_code": null,
  "discount": 0
}`
  },
  {
    module: "Order", emoji: "📦", color: "#d4b4e8", accent: "#7c4ac4",
    collection: "Firestore → orders",
    description: "Created when user places an order at checkout. Updated by backend after payment verification.",
    fields: [
      { key: "id", type: "string", desc: "Auto-generated Firestore ID (e.g. 'ord_20240122_001')" },
      { key: "user_id", type: "string", desc: "Firebase Auth UID of the buyer" },
      { key: "user_email", type: "string", desc: "Copied for sending confirmation email" },
      { key: "items", type: "OrderItem[]", desc: "Snapshot of cart items at purchase time (price locked)" },
      { key: "items[].product_id", type: "string", desc: "Firestore product ID" },
      { key: "items[].name", type: "string", desc: "Product name at time of purchase" },
      { key: "items[].price", type: "number", desc: "Price locked at purchase (won't change if product price changes)" },
      { key: "items[].quantity", type: "number", desc: "Units purchased" },
      { key: "items[].subtotal", type: "number", desc: "price × quantity" },
      { key: "shipping_address", type: "object", desc: "Full address copied from user profile at checkout" },
      { key: "subtotal", type: "number", desc: "Sum of all item subtotals before shipping/discount" },
      { key: "shipping_fee", type: "number", desc: "Flat shipping fee (e.g. 50)" },
      { key: "discount", type: "number", desc: "Coupon discount applied, 0 if none" },
      { key: "total", type: "number", desc: "Final amount: subtotal + shipping_fee - discount" },
      { key: "status", type: "string", desc: "'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'" },
      { key: "payment_status", type: "string", desc: "'pending' | 'paid' | 'failed' | 'refunded'" },
      { key: "razorpay_order_id", type: "string", desc: "Razorpay order ID from /payment/create-order" },
      { key: "razorpay_payment_id", type: "string | null", desc: "Filled after successful payment verification" },
      { key: "tracking_id", type: "string | null", desc: "Courier tracking number (added after shipping)" },
      { key: "notes", type: "string | null", desc: "Special instructions from buyer at checkout" },
      { key: "created_at", type: "timestamp", desc: "Order creation time" },
      { key: "updated_at", type: "timestamp", desc: "Last status update time" },
    ],
    example: `{
  "id": "ord_20240122_001",
  "user_id": "uid_firebase_abc123",
  "user_email": "priya@example.com",
  "items": [
    {
      "product_id": "prod_bear_001",
      "name": "Amigurumi Bear",
      "image_url": "https://storage.googleapis.com/.../bear-front.webp",
      "price": 450,
      "quantity": 2,
      "subtotal": 900
    }
  ],
  "shipping_address": {
    "name": "Priya Nair",
    "phone": "+919876543210",
    "line1": "42, MG Road",
    "city": "Kollam",
    "state": "Kerala",
    "pincode": "691001"
  },
  "subtotal": 900,
  "shipping_fee": 50,
  "discount": 0,
  "total": 950,
  "status": "paid",
  "payment_status": "paid",
  "razorpay_order_id": "order_Abc123XYZ",
  "razorpay_payment_id": "pay_Xyz789ABC",
  "tracking_id": null,
  "notes": null,
  "created_at": "2024-01-22T14:35:00Z",
  "updated_at": "2024-01-22T14:36:10Z"
}`
  },
  {
    module: "Payment API", emoji: "💳", color: "#b4c4e8", accent: "#2d4ec4",
    collection: "API Request/Response — not stored directly in Firestore",
    description: "Two API calls handle payment: create order (backend↔Razorpay) and verify payment (frontend→backend→Firestore).",
    fields: [
      { key: "— CREATE ORDER REQUEST —", type: "", desc: "POST /payment/create-order" },
      { key: "order_id", type: "string", desc: "Your Firestore order document ID" },
      { key: "amount", type: "number", desc: "Amount in PAISE (rupees × 100). E.g. ₹950 = 95000" },
      { key: "currency", type: "string", desc: "Always 'INR' for Indian Rupees" },
      { key: "receipt", type: "string", desc: "Your order ID as reference string" },
      { key: "— CREATE ORDER RESPONSE —", type: "", desc: "Returns from backend to frontend" },
      { key: "razorpay_order_id", type: "string", desc: "Razorpay's order ID (e.g. 'order_Abc123XYZ')" },
      { key: "amount", type: "number", desc: "Amount in paise (echoed back)" },
      { key: "currency", type: "string", desc: "'INR'" },
      { key: "key_id", type: "string", desc: "Razorpay PUBLIC key — safe to send to frontend" },
      { key: "— VERIFY PAYMENT REQUEST —", type: "", desc: "POST /payment/verify" },
      { key: "razorpay_order_id", type: "string", desc: "From create-order response" },
      { key: "razorpay_payment_id", type: "string", desc: "From Razorpay checkout success callback" },
      { key: "razorpay_signature", type: "string", desc: "HMAC-SHA256 signature from Razorpay — verify this!" },
      { key: "order_id", type: "string", desc: "Your Firestore order ID to update after success" },
      { key: "— VERIFY PAYMENT RESPONSE —", type: "", desc: "Returns from backend to frontend" },
      { key: "success", type: "boolean", desc: "true if signature valid + order updated in Firestore" },
      { key: "message", type: "string", desc: "'Payment verified successfully' or error message" },
      { key: "order_id", type: "string", desc: "Your Firestore order ID (redirect user to order page)" },
    ],
    example: `// STEP 1: Frontend → Your Backend
POST /payment/create-order
{
  "order_id": "ord_20240122_001",
  "amount": 95000,
  "currency": "INR",
  "receipt": "ord_20240122_001"
}

// STEP 2: Your Backend → Frontend
{
  "razorpay_order_id": "order_Abc123XYZ",
  "amount": 95000,
  "currency": "INR",
  "key_id": "rzp_test_XXXXXXXXXXXX"
}

// STEP 3: Frontend opens Razorpay checkout using above data
// On success, Razorpay gives: payment_id + signature

// STEP 4: Frontend → Your Backend (verify)
POST /payment/verify
{
  "razorpay_order_id": "order_Abc123XYZ",
  "razorpay_payment_id": "pay_Xyz789ABC",
  "razorpay_signature": "a1b2c3d4e5f6...",
  "order_id": "ord_20240122_001"
}

// STEP 5: Your Backend → Frontend
{
  "success": true,
  "message": "Payment verified successfully",
  "order_id": "ord_20240122_001"
}`
  }
];

const dayPlan = [
  { day: 1, phase: "Planning", task: "Wireframes, accounts, GitHub setup", output: "Repo + plan ready" },
  { day: 2, phase: "Frontend", task: "Vite setup, routing, folder structure", output: "App runs on localhost" },
  { day: 3, phase: "Frontend", task: "Home + Shop pages with mock data", output: "2 pages styled" },
  { day: 4, phase: "Frontend", task: "ProductDetail + Cart + CartContext", output: "Cart fully works" },
  { day: 5, phase: "Frontend", task: "Checkout page + responsive polish", output: "Full frontend done" },
  { day: 6, phase: "Backend", task: "FastAPI setup + project structure", output: "Server runs + /docs works" },
  { day: 7, phase: "Backend", task: "All REST endpoints + CORS config", output: "API testable in Swagger" },
  { day: 8, phase: "Backend", task: "Connect frontend to backend APIs", output: "Real API calls working" },
  { day: 9, phase: "Database", task: "Firestore setup + CRUD operations", output: "Real data in frontend" },
  { day: 10, phase: "Payments", task: "Razorpay full payment flow", output: "Test payment end-to-end" },
  { day: 11, phase: "Deploy", task: "Deploy frontend to Vercel", output: "Live frontend URL" },
  { day: 12, phase: "Deploy", task: "Deploy backend to Render + connect", output: "Full app live!" },
  { day: 13, phase: "Testing", task: "Manual testing + bug fixes", output: "Bug-free app" },
  { day: 14, phase: "Polish", task: "README, screenshots, demo video", output: "Interview-ready!" },
];

const phaseColors = { Planning: "#e8b4b8", Frontend: "#b4d4e8", Backend: "#b4e8c4", Database: "#f5d9a0", Payments: "#d4b4e8", Deploy: "#b4c4e8", Testing: "#e8d4b4", Polish: "#e8d4b4" };

const resumeTips = [
  { icon: "📸", tip: "Screenshot the Swagger /docs page — shows backend professionalism" },
  { icon: "🎬", tip: "Record a 2-min Loom video walkthrough — paste in resume + GitHub" },
  { icon: "📊", tip: "Mention metrics: '10+ products, real-time cart, UPI payment integration'" },
  { icon: "🔗", tip: "Add live Vercel link prominently in your resume project section" },
  { icon: "🗣️", tip: "Interview answer: 'I built the cart with React Context + useReducer for state management'" },
  { icon: "⭐", tip: "Highlight Razorpay signature verification — shows security awareness" },
  { icon: "📁", tip: "Show clean Git commit history — recruiters do check this" },
  { icon: "🧪", tip: "Mention you used Postman/Swagger to test APIs — shows professional workflow" },
];

function JsonBlock({ code }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{
        position: "absolute", top: 8, right: 8, padding: "4px 10px",
        background: copied ? "#2e9e56" : "rgba(255,255,255,0.15)", color: "white",
        border: "1px solid rgba(255,255,255,0.3)", borderRadius: 6,
        fontSize: 11, cursor: "pointer", zIndex: 1
      }}>{copied ? "✓ Copied!" : "Copy"}</button>
      <pre style={{ background: "#1a1a2e", color: "#a8d8e8", margin: 0, padding: "14px 16px", borderRadius: 10, fontSize: 12, lineHeight: 1.7, overflowX: "auto", fontFamily: "monospace" }}>{code}</pre>
    </div>
  );
}

export default function CrochetRoadmap() {
  const [activePhase, setActivePhase] = useState(0);
  const [activeTab, setActiveTab] = useState("phases");
  const [expandedTask, setExpandedTask] = useState(null);
  const [activeSchema, setActiveSchema] = useState(0);
  const [schemaView, setSchemaView] = useState("table");

  const phase = phases[activePhase];
  const schema = jsonSchemas[activeSchema];

  const tabs = [
    { id: "phases", label: "📋 Phase Guide" },
    { id: "json", label: "🗂️ JSON Schemas" },
    { id: "days", label: "📅 Day Plan" },
    { id: "resume", label: "⭐ Resume Tips" }
  ];

  return (
    <div style={{ fontFamily: "Georgia, serif", background: "linear-gradient(135deg,#fdf6f0,#fef9f4,#f9f0ee)", minHeight: "100vh", color: "#2a1f1a" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#3d2314,#6b3a28)", padding: "32px 24px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🧶</div>
        <h1 style={{ margin: 0, fontSize: "clamp(20px,4vw,30px)", color: "#fdf6f0", fontWeight: 700 }}>Crochet E-Commerce Roadmap</h1>
        <p style={{ color: "#e8c4a0", margin: "8px 0 0", fontSize: 14, fontStyle: "italic" }}>React · FastAPI · Firebase · Razorpay · Vercel + Render</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 14, flexWrap: "wrap" }}>
          {["⚛️ React", "⚡ FastAPI", "🔥 Firebase", "💳 Razorpay", "🚀 Vercel+Render"].map(t => (
            <span key={t} style={{ background: "rgba(255,255,255,0.12)", color: "#fdf6f0", padding: "4px 12px", borderRadius: 20, fontSize: 11, border: "1px solid rgba(255,255,255,0.2)" }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", justifyContent: "center", gap: 4, padding: "16px 16px 0", flexWrap: "wrap" }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: "9px 16px", borderRadius: 8, border: "2px solid",
            borderColor: activeTab === tab.id ? "#6b3a28" : "#d4b4a0",
            background: activeTab === tab.id ? "#6b3a28" : "white",
            color: activeTab === tab.id ? "white" : "#6b3a28",
            fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "Georgia,serif"
          }}>{tab.label}</button>
        ))}
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 16px 40px" }}>

        {/* PHASE GUIDE */}
        {activeTab === "phases" && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", justifyContent: "center" }}>
              {phases.map((p, i) => (
                <button key={p.id} onClick={() => { setActivePhase(i); setExpandedTask(null); }} style={{
                  padding: "7px 12px", borderRadius: 8, border: "2px solid",
                  borderColor: activePhase === i ? p.accent : "#d4b4a0",
                  background: activePhase === i ? p.color : "white",
                  color: "#2a1f1a", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "Georgia,serif"
                }}>{p.emoji} {p.title}</button>
              ))}
            </div>
            <div style={{ background: `linear-gradient(135deg,${phase.color}40,${phase.color}20)`, border: `2px solid ${phase.accent}40`, borderRadius: 16, padding: "18px 22px", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <span style={{ fontSize: 34 }}>{phase.emoji}</span>
                <div>
                  <h2 style={{ margin: 0, fontSize: 20 }}>Phase {phase.id}: {phase.title}</h2>
                  <span style={{ background: phase.accent, color: "white", padding: "2px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600 }}>{phase.days}</span>
                </div>
              </div>
            </div>
            {phase.tasks.map((task, i) => (
              <div key={i} style={{ background: "white", borderRadius: 12, marginBottom: 10, border: `1px solid ${phase.color}`, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <button onClick={() => setExpandedTask(expandedTask === i ? null : i)} style={{ width: "100%", padding: "15px 18px", textAlign: "left", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "Georgia,serif" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 26, height: 26, borderRadius: "50%", background: phase.accent, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{task.title}</span>
                  </div>
                  <span style={{ color: phase.accent }}>{expandedTask === i ? "▲" : "▼"}</span>
                </button>
                {expandedTask === i && (
                  <div style={{ padding: "0 18px 18px", borderTop: `1px solid ${phase.color}` }}>
                    <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
                      {[
                        { bg: "#fff8f0", border: "#e07b00", label: "💡 Why This Matters", text: task.why },
                        { bg: "#f0f8ff", border: "#4a90c4", label: "🔨 What To Do", text: task.what, mono: true },
                        { bg: "#f0fff4", border: "#2e9e56", label: "✅ Expected Output", text: task.output },
                        { bg: "#fdf0ff", border: "#9b4ac4", label: "🎓 Beginner Note", text: task.beginner },
                      ].map((s, j) => (
                        <div key={j} style={{ background: s.bg, padding: "10px 14px", borderRadius: 8, borderLeft: `3px solid ${s.border}` }}>
                          <div style={{ fontWeight: 700, fontSize: 10, color: s.border, marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</div>
                          <div style={{ fontSize: 13, lineHeight: 1.7, whiteSpace: s.mono ? "pre-line" : "normal", fontFamily: s.mono ? "monospace" : "Georgia,serif" }}>{s.text}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {phase.structure && (
              <div style={{ background: "#1e1e1e", borderRadius: 12, padding: "14px 18px", marginBottom: 10 }}>
                <div style={{ color: "#e8c4a0", fontWeight: 700, marginBottom: 8, fontSize: 12 }}>📁 {phase.structure.title}</div>
                <pre style={{ color: "#a8d8a8", margin: 0, fontSize: 12, lineHeight: 1.7, overflowX: "auto", fontFamily: "monospace" }}>{phase.structure.code}</pre>
              </div>
            )}
            <div style={{ background: `linear-gradient(135deg,${phase.accent}15,${phase.accent}08)`, border: `2px solid ${phase.accent}50`, borderRadius: 12, padding: "14px 18px", marginBottom: 10 }}>
              <div style={{ fontWeight: 700, color: phase.accent, marginBottom: 5, fontSize: 12 }}>🎯 MINI GOAL — End of {phase.title}</div>
              <div style={{ fontSize: 14, lineHeight: 1.6 }}>{phase.miniGoal}</div>
            </div>
            <div style={{ background: "#fff5f5", border: "2px solid #e8b4b4", borderRadius: 12, padding: "14px 18px" }}>
              <div style={{ fontWeight: 700, color: "#c44a4a", marginBottom: 8, fontSize: 12 }}>⚠️ COMMON MISTAKES TO AVOID</div>
              {phase.mistakes.map((m, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 13, lineHeight: 1.5 }}>
                  <span style={{ color: "#c44a4a", flexShrink: 0 }}>✗</span><span>{m}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* JSON SCHEMAS TAB */}
        {activeTab === "json" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 18 }}>
              <h2 style={{ color: "#3d2314", margin: "0 0 4px" }}>JSON Data Schemas</h2>
              <p style={{ color: "#8c6a5a", fontSize: 13, margin: 0 }}>Sample structure for every module — use for Firestore, mock data, and API responses</p>
            </div>

            {/* Module Pills */}
            <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap", justifyContent: "center" }}>
              {jsonSchemas.map((s, i) => (
                <button key={i} onClick={() => { setActiveSchema(i); setSchemaView("table"); }} style={{
                  padding: "7px 14px", borderRadius: 20, border: "2px solid",
                  borderColor: activeSchema === i ? s.accent : "#d4b4a0",
                  background: activeSchema === i ? s.color : "white",
                  color: "#2a1f1a", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "Georgia,serif"
                }}>{s.emoji} {s.module}</button>
              ))}
            </div>

            {/* Schema Card */}
            <div style={{ background: "white", borderRadius: 16, border: `2px solid ${schema.color}`, overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", marginBottom: 16 }}>
              <div style={{ background: `linear-gradient(135deg,${schema.color}60,${schema.color}25)`, padding: "18px 22px", borderBottom: `1px solid ${schema.color}` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 30 }}>{schema.emoji}</span>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 18 }}>{schema.module} Schema</h3>
                      <span style={{ background: schema.accent, color: "white", padding: "2px 10px", borderRadius: 10, fontSize: 10, fontWeight: 600 }}>{schema.collection}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.7)", borderRadius: 8, padding: 3 }}>
                    {[{ v: "table", label: "📋 Fields" }, { v: "example", label: "💾 Example JSON" }].map(({ v, label }) => (
                      <button key={v} onClick={() => setSchemaView(v)} style={{
                        padding: "6px 12px", borderRadius: 6, border: "none",
                        background: schemaView === v ? schema.accent : "transparent",
                        color: schemaView === v ? "white" : "#6b3a28",
                        fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "Georgia,serif"
                      }}>{label}</button>
                    ))}
                  </div>
                </div>
                <p style={{ margin: "10px 0 0", fontSize: 13, color: "#4a3a2a", lineHeight: 1.5 }}>{schema.description}</p>
              </div>

              {schemaView === "table" ? (
                <div style={{ overflowX: "auto" }}>
                  <div style={{ padding: "8px 16px 2px", fontSize: 11, color: "#8c6a5a", fontStyle: "italic" }}>
                    ℹ️ Switch to "Example JSON" to see a complete sample document ready to paste into Firestore.
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: "#f5f0eb" }}>
                        <th style={{ padding: "9px 14px", textAlign: "left", fontWeight: 700, borderBottom: "2px solid #e0d0c4", whiteSpace: "nowrap", width: "35%" }}>Field</th>
                        <th style={{ padding: "9px 14px", textAlign: "left", fontWeight: 700, borderBottom: "2px solid #e0d0c4", width: "20%" }}>Type</th>
                        <th style={{ padding: "9px 14px", textAlign: "left", fontWeight: 700, borderBottom: "2px solid #e0d0c4" }}>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schema.fields.map((f, i) => {
                        const isSectionHeader = f.key.startsWith("—");
                        return (
                          <tr key={i} style={{ background: isSectionHeader ? schema.color + "30" : (i % 2 === 0 ? "white" : "#fafafa") }}>
                            <td style={{ padding: "7px 14px", fontFamily: "monospace", fontSize: 12, color: isSectionHeader ? schema.accent : "#2d4ec4", fontWeight: isSectionHeader ? 700 : 400, borderBottom: "1px solid #eee" }}>
                              {isSectionHeader ? f.key : f.key}
                            </td>
                            <td style={{ padding: "7px 14px", color: "#7c4ac4", fontSize: 12, fontFamily: "monospace", borderBottom: "1px solid #eee" }}>{f.type}</td>
                            <td style={{ padding: "7px 14px", color: "#3a3a3a", borderBottom: "1px solid #eee", lineHeight: 1.5 }}>{f.desc}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: 16 }}>
                  <div style={{ fontSize: 12, color: "#8c6a5a", marginBottom: 10, fontStyle: "italic" }}>
                    💡 Paste this into Firebase Console → Firestore → Add Document, or use it as mock data in your React frontend.
                  </div>
                  <JsonBlock code={schema.example} />
                </div>
              )}
            </div>

            {/* Connection Map */}
            <div style={{ background: "#1a1a2e", borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ color: "#e8c4a0", fontWeight: 700, marginBottom: 12, fontSize: 13 }}>🔗 How These Schemas Connect to Each Other</div>
              <div style={{ display: "grid", gap: 8 }}>
                {[
                  { arrow: "Product → Cart", desc: "Add to cart copies product_id, name, image_url, price into a CartItem. Price is locked." },
                  { arrow: "Cart → Order", desc: "At checkout, cart.items snapshot becomes order.items. Price is frozen at purchase time." },
                  { arrow: "Order → Payment", desc: "order.total × 100 = Razorpay amount in paise. order.id is passed as receipt." },
                  { arrow: "Payment → Order", desc: "After verification, save razorpay_payment_id to order. Set status = 'paid'." },
                  { arrow: "User → Order", desc: "user.id stored in order.user_id. user.address copied to order.shipping_address." },
                  { arrow: "Category → Product", desc: "product.category matches category.slug for filtering on the Shop page." },
                ].map((c, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ color: "#7c9ef0", fontWeight: 700, fontSize: 12, fontFamily: "monospace", flexShrink: 0, minWidth: 170 }}>{c.arrow}</span>
                    <span style={{ color: "#c8c8d8", fontSize: 13, lineHeight: 1.5 }}>{c.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DAY PLAN */}
        {activeTab === "days" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 18 }}>
              <h2 style={{ color: "#3d2314", margin: "0 0 4px" }}>14-Day Build Plan</h2>
              <p style={{ color: "#8c6a5a", fontSize: 13, margin: 0 }}>Realistic daily schedule — learning while building</p>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {dayPlan.map((d) => (
                <div key={d.day} style={{ display: "grid", gridTemplateColumns: "52px 1fr 1fr", alignItems: "center", gap: 10, background: "white", borderRadius: 10, padding: "12px 14px", border: `1px solid ${phaseColors[d.phase]}`, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: phaseColors[d.phase], display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, opacity: 0.6 }}>DAY</div>
                    <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1 }}>{d.day}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{d.task}</div>
                    <span style={{ background: phaseColors[d.phase], color: "#2a1f1a", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{d.phase}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#5a7a5a", background: "#f0fff4", padding: "7px 10px", borderRadius: 8, borderLeft: "3px solid #2e9e56" }}>
                    <span style={{ fontWeight: 600 }}>Output: </span>{d.output}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RESUME TIPS */}
        {activeTab === "resume" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <h2 style={{ color: "#3d2314", margin: "0 0 4px" }}>Make It Stand Out</h2>
              <p style={{ color: "#8c6a5a", fontSize: 13, margin: 0 }}>How to present this on your resume and in interviews</p>
            </div>
            <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", marginBottom: 20 }}>
              {resumeTips.map((t, i) => (
                <div key={i} style={{ background: "white", borderRadius: 12, padding: "14px 16px", border: "1px solid #e8d4c4", display: "flex", gap: 10, alignItems: "flex-start", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{t.icon}</span>
                  <span style={{ fontSize: 13, lineHeight: 1.6 }}>{t.tip}</span>
                </div>
              ))}
            </div>
            <div style={{ background: "#1e1e1e", borderRadius: 12, padding: "18px 22px", marginBottom: 14 }}>
              <div style={{ color: "#e8c4a0", fontWeight: 700, marginBottom: 10 }}>📝 Resume Bullet Points (Copy-Paste Ready)</div>
              {["• Built a full-stack crochet e-commerce platform using React, FastAPI, and Firebase Firestore with real-time inventory management",
                "• Integrated Razorpay UPI payment gateway with backend HMAC signature verification for secure transactions",
                "• Implemented React Context + useReducer for global cart state management across multiple pages",
                "• Designed RESTful API with FastAPI featuring auto-generated Swagger documentation and CORS configuration",
                "• Deployed frontend on Vercel with CI/CD and backend on Render with environment-based configuration"
              ].map((b, i) => (
                <div key={i} style={{ color: "#a8d8a8", fontSize: 12, lineHeight: 1.8, fontFamily: "monospace" }}>{b}</div>
              ))}
            </div>
            <div style={{ background: "#fff8f0", border: "2px solid #e8c4a0", borderRadius: 12, padding: "18px 22px" }}>
              <div style={{ fontWeight: 700, color: "#c47c00", marginBottom: 12, fontSize: 14 }}>🎤 Interview Q&A</div>
              {[
                { q: "How does the cart work?", a: "React Context API with useReducer — similar to Redux but built-in. Each action (ADD, REMOVE, UPDATE) updates global cart state, which all components subscribe to." },
                { q: "How did you handle payments?", a: "Backend creates Razorpay order → frontend opens checkout → backend verifies HMAC signature to prevent spoofing → Firestore updated to 'paid'." },
                { q: "Why FastAPI over Flask/Django?", a: "Auto Swagger docs, Pydantic validation, async support, and significantly faster performance. Perfect for REST APIs." },
                { q: "What would you improve?", a: "Firebase Auth for login, product search, admin dashboard for inventory, and unit tests for the payment flow." }
              ].map((qa, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ fontWeight: 600, color: "#3d2314", marginBottom: 3, fontSize: 13 }}>Q: {qa.q}</div>
                  <div style={{ color: "#5a4a3a", fontSize: 13, lineHeight: 1.6, paddingLeft: 12, borderLeft: "3px solid #e8c4a0" }}>A: {qa.a}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
