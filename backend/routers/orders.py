from fastapi import APIRouter, HTTPException
from typing import List
from models.schemas import Order, OrderCreate
from config.firebase import db
import uuid
from datetime import datetime

router = APIRouter(
    prefix="/orders",
    tags=["orders"],
)

MOCK_ORDERS = []

@router.post("/", response_model=Order)
def create_order(order: OrderCreate):
    new_order = Order(
        **order.model_dump(),
        id=f"ord_{uuid.uuid4().hex[:8]}",
        status="pending",
        payment_status=order.payment_status if hasattr(order, 'payment_status') and order.payment_status else "pending",
        created_at=datetime.utcnow().isoformat() + "Z",
        updated_at=datetime.utcnow().isoformat() + "Z"
    )
    
    if db:
        db.collection("orders").document(new_order.id).set(new_order.model_dump())
        print(f"✅ Order {new_order.id} saved to Firestore!")
    else:
        MOCK_ORDERS.append(new_order)
        print("⚠️ Order saved to MOCK storage")

    return new_order

@router.get("/track/{phone}")
def track_orders_by_phone(phone: str):
    """Look up all orders by customer phone number — for order tracking page."""
    import re
    # Clean input phone: keep only digits
    search_phone = re.sub(r"\D", "", phone)
    
    if db:
        # To be safe and catch all (even old formatting), fetch all recent orders 
        # and filter by cleaned phone in Python
        # (Assuming the shop has < 1000 orders, this is very fast)
        docs = db.collection("orders").order_by("created_at", direction="DESCENDING").limit(500).stream()
        
        all_matches = []
        for doc in docs:
            order = doc.to_dict()
            stored_phone = order.get("shipping_address", {}).get("phone", "")
            # Clean stored phone and compare
            if re.sub(r"\D", "", stored_phone) == search_phone:
                all_matches.append(order)
        
        if not all_matches:
            raise HTTPException(status_code=404, detail="No orders found for this phone number.")
            
        return all_matches
    raise HTTPException(status_code=503, detail="Database not available.")




@router.get("/user/{user_id}", response_model=List[Order])
def get_user_orders(user_id: str):
    if db:
        docs = db.collection("orders").where("user_id", "==", user_id).order_by("created_at", direction="DESCENDING").stream()
        return [doc.to_dict() for doc in docs]
    
    return [order for order in MOCK_ORDERS if order.user_id == user_id]

@router.get("/{order_id}", response_model=Order)
def get_order(order_id: str):
    if db:
        doc = db.collection("orders").document(order_id).get()
        if doc.exists:
            return doc.to_dict()

    for order in MOCK_ORDERS:
        if order.id == order_id:
            return order
    raise HTTPException(status_code=404, detail="Order not found")

