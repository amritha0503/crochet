import os
import uuid
from fastapi import APIRouter, HTTPException, Header, Depends, UploadFile, File
from pydantic import BaseModel
from models.schemas import Product
from config.firebase import db
from dotenv import load_dotenv

load_dotenv()
ADMIN_PASSKEY = os.getenv("ADMIN_PASSKEY", "crochetsecret2026")

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
)

def verify_passkey(x_admin_passkey: str = Header(...)):
    if x_admin_passkey != ADMIN_PASSKEY:
        raise HTTPException(status_code=403, detail="Invalid admin passkey")
    return True

@router.post("/products", response_model=Product)
def add_product(product: Product, authorized: bool = Depends(verify_passkey)):
    if db:
        # Check if product ID already exists
        doc_ref = db.collection("products").document(product.id)
        if doc_ref.get().exists:
            raise HTTPException(status_code=400, detail="Product ID already exists")
        doc_ref.set(product.model_dump())
        return product
    raise HTTPException(status_code=500, detail="Database not configured")

@router.put("/products/{product_id}", response_model=Product)
def update_product(product_id: str, product: Product, authorized: bool = Depends(verify_passkey)):
    if db:
        # Ensure the ID in payload matches endpoint
        product.id = product_id
        doc_ref = db.collection("products").document(product_id)
        # Use set() with merge=False to upsert — works even if the doc doesn't exist yet
        doc_ref.set(product.model_dump())
        return product
    raise HTTPException(status_code=500, detail="Database not configured")


@router.delete("/products/{product_id}")
def delete_product(product_id: str, authorized: bool = Depends(verify_passkey)):
    if db:
        doc_ref = db.collection("products").document(product_id)
        if not doc_ref.get().exists:
            raise HTTPException(status_code=404, detail="Product not found")
        doc_ref.delete()
        return {"success": True, "message": f"Product {product_id} deleted"}
    raise HTTPException(status_code=500, detail="Database not configured")

@router.post("/verify")
def verify_admin_login(authorized: bool = Depends(verify_passkey)):
    return {"success": True, "message": "Authenticated"}

@router.post("/upload")
def upload_image(file: UploadFile = File(...), authorized: bool = Depends(verify_passkey)):
    try:
        import cloudinary
        import cloudinary.uploader

        # Configure Cloudinary from env vars
        cloudinary.config(
            cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
            api_key=os.getenv("CLOUDINARY_API_KEY"),
            api_secret=os.getenv("CLOUDINARY_API_SECRET"),
            secure=True
        )

        # Upload directly from file stream
        result = cloudinary.uploader.upload(
            file.file,
            folder="crochet-products",
            resource_type="image"
        )

        return {"success": True, "url": result["secure_url"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")


class OrderStatusUpdate(BaseModel):
    status: str

@router.get("/orders")
def get_all_orders(authorized: bool = Depends(verify_passkey)):
    if db:
        docs = db.collection("orders").order_by("created_at", direction="DESCENDING").stream()
        return [doc.to_dict() for doc in docs]
    raise HTTPException(status_code=500, detail="Database not configured")

@router.put("/orders/{order_id}/status")
def update_order_status(order_id: str, update: OrderStatusUpdate, authorized: bool = Depends(verify_passkey)):
    if db:
        doc_ref = db.collection("orders").document(order_id)
        if not doc_ref.get().exists:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # update status and optionally payment_status if we wanted
        doc_ref.update({"status": update.status})
        return {"success": True, "status": update.status}
    raise HTTPException(status_code=500, detail="Database not configured")

@router.delete("/orders/{order_id}")
def delete_order(order_id: str, authorized: bool = Depends(verify_passkey)):
    if db:
        doc_ref = db.collection("orders").document(order_id)
        if not doc_ref.get().exists:
            raise HTTPException(status_code=404, detail="Order not found")
        doc_ref.delete()
        return {"success": True, "message": f"Order {order_id} deleted"}
    raise HTTPException(status_code=500, detail="Database not configured")

@router.get("/reviews")
def get_all_reviews(authorized: bool = Depends(verify_passkey)):
    if not db:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    all_reviews = []
    docs = db.collection("products").stream()
    for doc in docs:
        product_data = doc.to_dict()
        reviews = product_data.get("reviews", [])
        for review in reviews:
            all_reviews.append({
                **review,
                "product_id": product_data.get("id"),
                "product_name": product_data.get("name", "Unknown Product"),
            })
            
    # Sort newest first
    all_reviews.sort(key=lambda r: r.get("created_at", ""), reverse=True)
    return all_reviews

@router.delete("/products/{product_id}/reviews/{review_id}")
def delete_review(product_id: str, review_id: str, authorized: bool = Depends(verify_passkey)):
    if not db:
        raise HTTPException(status_code=500, detail="Database not configured")
        
    doc_ref = db.collection("products").document(product_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Product not found")
        
    product_data = doc.to_dict()
    reviews = product_data.get("reviews", [])
    
    # Filter out the deleted review
    filtered_reviews = [r for r in reviews if r.get("id") != review_id and r.get("user_id") != review_id]
    
    if len(filtered_reviews) == len(reviews):
        raise HTTPException(status_code=404, detail="Review not found")
        
    doc_ref.update({"reviews": filtered_reviews})
    return {"success": True, "message": "Review deleted"}
