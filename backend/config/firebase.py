import firebase_admin
from firebase_admin import credentials, firestore
import os

# Get path to the service account key relative to this file
# We expect the user to drop serviceAccountKey.json into the /backend directory
cred_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "serviceAccountKey.json")

def get_db():
    if not firebase_admin._apps:
        if not os.path.exists(cred_path):
            print(f"⚠️ WARNING: {cred_path} not found! Firebase will not connect.")
            return None
            
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        
    return firestore.client()

db = get_db()
