import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from config.firebase import db
from routers.products import MOCK_PRODUCTS, MOCK_CATEGORIES

def seed_database():
    if db is None:
        print("❌ Cannot connect to Firestore. Missing serviceAccountKey.json!")
        return

    print("🌱 Seeding Firestore Database...")
    
    # 1. Seed Products
    print("Seeding products...")
    for product in MOCK_PRODUCTS:
        doc_ref = db.collection("products").document(product["id"])
        doc_ref.set(product)
        print(f"  ✅ Added Product: {product['name']}")

    # 2. Seed Categories
    print("Seeding categories...")
    for cat in MOCK_CATEGORIES:
        doc_ref = db.collection("categories").document(cat["id"])
        doc_ref.set(cat)
        print(f"  ✅ Added Category: {cat['name']}")

    print("\n🎉 Seeding Complete! Data is now in Firebase Firestore.")

if __name__ == "__main__":
    seed_database()
