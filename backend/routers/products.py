from fastapi import APIRouter, HTTPException
from typing import List
from models.schemas import Product, Category, Review
from config.firebase import db
import uuid
import datetime

router = APIRouter(
    prefix="/products",
    tags=["products"],
)

MOCK_PRODUCTS = [
    {
        "id": "prod_bear_001",
        "name": "Amigurumi Bear",
        "slug": "amigurumi-bear",
        "description": "Handcrafted crochet teddy bear made with 100% cotton yarn.",
        "price": 450,
        "compare_price": 600,
        "category": "amigurumi",
        "tags": ["handmade", "gift", "cotton", "baby"],
        "images": ["https://storage.googleapis.com/.../bear-front.webp"],
        "stock": 12,
        "is_featured": True,
        "is_active": True,
        "weight_grams": 150,
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-20T08:00:00Z"
    },
    {
        "id": "prod_tote_002",
        "name": "Crochet Tote Bag",
        "slug": "crochet-tote",
        "description": "Stylish and reusable crochet tote bag.",
        "price": 650,
        "category": "bags",
        "tags": ["bag", "eco"],
        "images": [],
        "stock": 5,
        "is_featured": True,
        "is_active": True,
        "weight_grams": 200,
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-20T08:00:00Z"
    },
    {
        "id": "prod_sun_003",
        "name": "Sunflower Decor",
        "slug": "sunflower",
        "description": "Brighten your room with a crochet sunflower.",
        "price": 350,
        "category": "home-decor",
        "tags": ["decor", "flower"],
        "images": [],
        "stock": 8,
        "is_featured": True,
        "is_active": True,
        "weight_grams": 100,
        "created_at": "2024-01-16T10:30:00Z",
        "updated_at": "2024-01-21T08:00:00Z"
    }
]

MOCK_CATEGORIES = [
    {
        "id": "cat_amigurumi",
        "name": "Amigurumi",
        "slug": "amigurumi",
        "description": "Cute crocheted stuffed animals and dolls",
        "image_url": "https://storage.googleapis.com/.../amigurumi-banner.webp",
        "product_count": 8,
        "sort_order": 1,
        "is_active": True
    },
    {
        "id": "cat_bags",
        "name": "Bags",
        "slug": "bags",
        "description": "Stylish handmade crochet bags.",
        "image_url": "",
        "product_count": 5,
        "sort_order": 2,
        "is_active": True
    },
    {
        "id": "cat_home",
        "name": "Home Decor",
        "slug": "home-decor",
        "description": "Beautiful decorations for your room.",
        "image_url": "",
        "product_count": 5,
        "sort_order": 3,
        "is_active": True
    }
]

@router.get("/", response_model=List[Product])
def get_products(category: str = None):
    # If Firestore is connected, query from DB
    if db:
        products_ref = db.collection("products")
        if category:
            docs = products_ref.where("category", "==", category).stream()
        else:
            docs = products_ref.stream()
            
        products = [doc.to_dict() for doc in docs]
        if products:
            return products

    # Fallback to mock data if no db or empty DB
    print("⚠️ Returning MOCK logic for products")
    if category:
        return [p for p in MOCK_PRODUCTS if p["category"] == category]
    return MOCK_PRODUCTS

@router.get("/{product_id}", response_model=Product)
def get_product(product_id: str):
    if db:
        doc = db.collection("products").document(product_id).get()
        if doc.exists:
            return doc.to_dict()

    for p in MOCK_PRODUCTS:
        if p["id"] == product_id:
            return p
    raise HTTPException(status_code=404, detail="Product not found")

@router.get("/categories/all", response_model=List[Category])
def get_categories():
    if db:
        docs = db.collection("categories").order_by("sort_order").stream()
        categories = [doc.to_dict() for doc in docs]
        if categories:
            return categories

    return MOCK_CATEGORIES

@router.post("/{product_id}/reviews", response_model=Product)
def add_product_review(product_id: str, review: Review):
    if not db:
        raise HTTPException(status_code=500, detail="Database not connected")
        
    doc_ref = db.collection("products").document(product_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Product not found")
        
    product_data = doc.to_dict()
    reviews = product_data.get("reviews", [])
    if not reviews:
        reviews = []
        
    new_review = review.model_dump()
    new_review["created_at"] = datetime.datetime.utcnow().isoformat() + "Z"
    
    reviews.append(new_review)
    doc_ref.update({"reviews": reviews})
    
    product_data["reviews"] = reviews
    return product_data

