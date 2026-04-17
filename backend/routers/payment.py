import os
import razorpay
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from config.firebase import db

load_dotenv()

key_id = os.getenv("RAZORPAY_KEY_ID", "rzp_test_placeholder")
key_secret = os.getenv("RAZORPAY_KEY_SECRET", "secret_placeholder")

client = razorpay.Client(auth=(key_id, key_secret))

router = APIRouter(
    prefix="/payment",
    tags=["payment"],
)

class CreateOrderRequest(BaseModel):
    order_id: str
    amount: int  # Amount in paise (rupees * 100)
    currency: str = "INR"
    receipt: str

class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    order_id: str

@router.post("/create-order")
def create_payment_order(data: CreateOrderRequest):
    try:
        payment_data = {
            "amount": data.amount,
            "currency": data.currency,
            "receipt": data.receipt,
        }
        razorpay_order = client.order.create(data=payment_data)
        
        # We also need to send the RAZORPAY_KEY_ID back to frontend
        # so they can initialize the checkout popup
        return {
            "razorpay_order_id": razorpay_order["id"],
            "amount": razorpay_order["amount"],
            "currency": razorpay_order["currency"],
            "key_id": key_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify")
def verify_payment(data: VerifyPaymentRequest):
    try:
        # Razorpay utility verifies HMAC signature
        result = client.utility.verify_payment_signature({
            'razorpay_order_id': data.razorpay_order_id,
            'razorpay_payment_id': data.razorpay_payment_id,
            'razorpay_signature': data.razorpay_signature
        })
        
        if result:
            # Payment is verified successfully
            # Update Firestore order status
            if db:
                order_ref = db.collection("orders").document(data.order_id)
                order_ref.update({
                    "status": "paid",
                    "payment_status": "paid",
                    "razorpay_payment_id": data.razorpay_payment_id
                })
                
            return {"success": True, "message": "Payment verified successfully", "order_id": data.order_id}
            
    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Payment signature verification failed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
