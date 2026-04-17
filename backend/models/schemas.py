from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Review(BaseModel):
    user_id: str
    user_name: str
    rating: int
    comment: str
    created_at: str

class Product(BaseModel):
    id: str
    name: str
    slug: str
    description: str
    price: int
    compare_price: Optional[int] = None
    category: str
    tags: List[str]
    images: List[str]
    stock: int
    is_featured: bool
    is_active: bool
    weight_grams: int
    reviews: Optional[List[Review]] = []
    created_at: str
    updated_at: str

class Category(BaseModel):
    id: str
    name: str
    slug: str
    description: str
    image_url: str
    product_count: int
    sort_order: int
    is_active: bool

class OrderItem(BaseModel):
    product_id: str
    name: str
    image_url: str
    price: int
    quantity: int
    subtotal: int

class ShippingAddress(BaseModel):
    name: str
    phone: str
    line1: str
    city: str
    state: str
    pincode: str

class OrderCreate(BaseModel):
    user_id: Optional[str] = None
    items: List[OrderItem]
    shipping_address: ShippingAddress
    subtotal: int
    shipping_fee: int
    discount: int
    total: int

class Order(OrderCreate):
    id: str
    user_id: Optional[str] = None
    user_email: Optional[str] = None
    status: str
    payment_status: str
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    tracking_id: Optional[str] = None
    notes: Optional[str] = None
    created_at: str
    updated_at: str
