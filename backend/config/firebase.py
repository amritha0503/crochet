import firebase_admin
from firebase_admin import credentials, firestore, storage
import os
import json

# Path to service account key (used locally)
cred_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "serviceAccountKey.json")

FIREBASE_STORAGE_BUCKET = "crochet-stories.firebasestorage.app"

def get_db():
    if not firebase_admin._apps:
        # Try file first (local dev), then fall back to env variable (Render/production)
        if os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
        else:
            creds_json = os.getenv("FIREBASE_CREDENTIALS_JSON")
            if not creds_json:
                print("⚠️ WARNING: No Firebase credentials found! Set FIREBASE_CREDENTIALS_JSON env var on Render.")
                return None
            cred = credentials.Certificate(json.loads(creds_json))

        firebase_admin.initialize_app(cred, {
            "storageBucket": FIREBASE_STORAGE_BUCKET
        })

    return firestore.client()

def get_bucket():
    """Returns the Firebase Storage bucket instance."""
    if not firebase_admin._apps:
        get_db()  # ensure app is initialized
    return storage.bucket()

db = get_db()

