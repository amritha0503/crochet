import firebase_admin
from firebase_admin import credentials, firestore, storage
import os

# Get path to the service account key relative to this file
# We expect the user to drop serviceAccountKey.json into the /backend directory
cred_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "serviceAccountKey.json")

FIREBASE_STORAGE_BUCKET = "crochet-stories.firebasestorage.app"

def get_db():
    if not firebase_admin._apps:
        if not os.path.exists(cred_path):
            print(f"⚠️ WARNING: {cred_path} not found! Firebase will not connect.")
            return None

        cred = credentials.Certificate(cred_path)
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
