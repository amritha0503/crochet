import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from routers import products, orders, payment, admin

app = FastAPI(
    title="Crochet E-Commerce API",
    description="Backend API for the Crochet Boutique",
    version="1.0.0"
)

# CORS configuration
origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("static/images", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(products.router)
app.include_router(orders.router)
app.include_router(payment.router)
app.include_router(admin.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Crochet E-Commerce API! Visit /docs for Swagger documentation."}
