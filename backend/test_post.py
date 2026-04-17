import requests

payload = {
  "user_id": None,
  "items": [
    {
      "product_id": "string",
      "name": "string",
      "image_url": "string",
      "price": 0,
      "quantity": 0,
      "subtotal": 0
    }
  ],
  "shipping_address": {
    "name": "string",
    "phone": "string",
    "line1": "string",
    "city": "string",
    "state": "string",
    "pincode": "string"
  },
  "subtotal": 0,
  "shipping_fee": 0,
  "discount": 0,
  "total": 0
}

r = requests.post("http://localhost:8000/orders/", json=payload)
print(r.status_code)
print(r.json())
