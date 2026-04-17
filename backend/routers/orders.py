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
    if db:
        # Fetch all orders for this phone
        docs = db.collection("orders")\
            .where("shipping_address.phone", "==", phone)\
            .stream()
        
        orders = [doc.to_dict() for doc in docs]
        
        if not orders:
            raise HTTPException(status_code=404, detail="No orders found for this phone number.")
            
        # Sort by created_at descending in Python to avoid needing a Firestore index
        orders.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return orders
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

