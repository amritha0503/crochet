# Crochet Boutique

A full-stack e-commerce application for a crochet boutique, featuring a modern React frontend and a fast, scalable FastAPI backend.

## 🚀 Tech Stack

### Frontend
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS 4
- **Routing:** React Router DOM
- **Authentication & Backend Services:** Firebase
- **HTTP Client:** Axios

### Backend
- **Framework:** FastAPI
- **Server:** Uvicorn
- **Database / Cloud Services:** Firebase Admin SDK (Firestore, Storage)
- **Payments:** Razorpay
- **Image Management:** Cloudinary

## 📁 Project Structure

```
crochet/
├── backend/                # FastAPI backend application
│   ├── config/             # Configuration files
│   ├── models/             # Pydantic models & schemas
│   ├── routers/            # API endpoints (products, orders, payment, admin)
│   ├── scripts/            # Utility scripts
│   ├── static/             # Static files
│   ├── main.py             # FastAPI application entry point
│   └── requirements.txt    # Python dependencies
└── frontend/               # React frontend application
    ├── public/             # Public assets
    ├── src/                # React source code (components, pages, etc.)
    ├── package.json        # Node dependencies
    └── vite.config.ts      # Vite configuration
```

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- Python (v3.9 or higher recommended)
- Firebase Account and Project
- Razorpay Account (for payments)
- Cloudinary Account (for image hosting)

### 1. Backend Setup
Navigate to the backend directory and set up the Python environment:
```bash
cd backend
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate

# Activate virtual environment (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**Environment Variables & Secrets:**
1. Create a `.env` file in the `backend` directory. Add your configuration details for Firebase, Razorpay, and Cloudinary.
2. Ensure your Firebase `serviceAccountKey.json` is placed in the `backend` directory for the Firebase Admin SDK.

**Run the backend server:**
```bash
uvicorn main:app --reload
```
The API will be running at `http://localhost:8000`. You can access the Swagger UI documentation at `http://localhost:8000/docs`.

### 2. Frontend Setup
Open a new terminal window, navigate to the frontend directory, and install dependencies:
```bash
cd frontend
npm install
```

**Environment Variables (.env):**
Create a `.env` file in the `frontend` directory and add your Firebase configuration and any other required public keys (e.g., Razorpay key).

**Run the frontend development server:**
```bash
npm run dev
```
The application will be accessible at `http://localhost:5173`.

## ✨ Key Features
- **Product Catalog:** Browse and view detailed information about crochet products.
- **Shopping Cart & Checkout:** Seamless user experience for purchasing items.
- **Payment Integration:** Secure payment processing using Razorpay.
- **Admin Management:** Dedicated routes to manage products and orders.
- **Media Management:** Efficient image handling via Cloudinary and Firebase Storage.
