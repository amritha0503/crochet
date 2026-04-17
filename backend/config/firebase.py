import firebase_admin
from firebase_admin import credentials, firestore, storage
import os
import json

# Path to service account key (used locally)
cred_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "serviceAccountKey.json")

# Firebase Storage bucket — try both naming conventions
# Newer Firebase projects use .firebasestorage.app; older use .appspot.com
FIREBASE_STORAGE_BUCKET = os.getenv("FIREBASE_STORAGE_BUCKET", "crochet-stories.appspot.com")

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

            print(f"🪣 Using Firebase Storage bucket: {FIREBASE_STORAGE_BUCKET}")
            firebase_admin.initialize_app(cred, {
                "storageBucket": FIREBASE_STORAGE_BUCKET
            })
            print("✅ Firebase initialized successfully!")
        except Exception as e:
            print(f"❌ Firebase initialization failed: {e}")
            return None

    return firestore.client()

def get_bucket():
    """Returns the Firebase Storage bucket instance."""
    if not firebase_admin._apps:
        get_db()
    try:
        return storage.bucket()
    except Exception as e:
        raise RuntimeError(f"Firebase Storage bucket not available: {e}. "
                           f"Check FIREBASE_CREDENTIALS_JSON and FIREBASE_STORAGE_BUCKET on Render.")

db = get_db()
