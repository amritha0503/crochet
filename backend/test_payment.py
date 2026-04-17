import requests

payload = {
  "order_id": "ord_123",
  "amount": 50000,
  "currency": "INR",
  "receipt": "ord_123"
}

r = requests.post("http://localhost:8000/payment/create-order", json=payload)
print(r.status_code)
print(r.text)
