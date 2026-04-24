from firebase_admin import auth
from app.firebase import db
from datetime import datetime, timezone

def verify_firebase_token(id_token: str):
    try:
        # PROD BYPASS for Demo (matches frontend LoginScreen.jsx)
        if id_token.startswith("demo-token-"):
            uid = id_token.replace("demo-token-", "")
            # Try to fetch real name from DB if it exists
            user_ref = db.collection("users").document(uid)
            user_doc = user_ref.get()
            
            if user_doc.exists:
                return user_doc.to_dict()

            # Fallback for new demo accounts
            return {
                "uid": uid,
                "phone": "999111222" + uid[-1] if (len(uid) > 0 and uid[-1].isdigit()) else "9991112220",
                "name": f"Operative {uid.split('-')[0].capitalize()}",
                "lat": None,
                "lng": None
            }

        decoded_token = auth.verify_id_token(id_token)

        uid = decoded_token["uid"]
        phone = decoded_token.get("phone_number")

        user_ref = db.collection("users").document(uid)
        user_doc = user_ref.get()

        if not user_doc.exists:
            user_data = {
                "uid": uid,
                "phone": phone,
                "name": "",
                "fcm_token": "",
                "lat": None,
                "lng": None,
                "last_seen": datetime.now(timezone.utc),
                "skills": []
            }
            user_ref.set(user_data)
        else:
            user_data = user_doc.to_dict()
            # Ensure phone is included if it was added later
            if "phone" not in user_data or not user_data["phone"]:
                user_data["phone"] = phone
            
            user_ref.update({
                "last_seen": datetime.now(timezone.utc)
            })

        return user_data

    except Exception as e:
        raise Exception(f"Token verification failed: {str(e)}")