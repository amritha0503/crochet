import firebase_admin
from firebase_admin import credentials, firestore
import os
import json

# Path to service account key (used locally)
cred_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "serviceAccountKey.json")

def get_db():
    if not firebase_admin._apps:
        try:
            # Try file first (local dev), then fall back to env variable (Render/production)
            if os.path.exists(cred_path):
                print(f"✅ Loading Firebase credentials from file: {cred_path}")
                cred = credentials.Certificate(cred_path)
            else:
                creds_json = os.getenv("FIREBASE_CREDENTIALS_JSON")
                if not creds_json:
                    print("❌ FIREBASE_CREDENTIALS_JSON env var is missing on Render!")
                    return None
                print("✅ Loading Firebase credentials from FIREBASE_CREDENTIALS_JSON env var")
                cred = credentials.Certificate(json.loads(creds_json))

            firebase_admin.initialize_app(cred)
            print("✅ Firebase initialized successfully!")
        except Exception as e:
            print(f"❌ Firebase initialization failed: {e}")
            return None

    return firestore.client()

db = get_db()
