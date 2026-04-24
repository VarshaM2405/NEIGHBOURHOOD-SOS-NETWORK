from app.firebase import db
from datetime import datetime,timezone

def get_user(uid:str):
    user_ref = db.collection("users").document(uid)
    user_doc = user_ref.get()

    if not user_doc.exists:
        return None
    return user_doc.to_dict()

def update_location(uid:str,lat:float,lng:float):
    user_ref = db.collection("users").document(uid)
    user_ref.update({
        "lat": lat,
        "lng": lng,
        "last_seen": datetime.now(timezone.utc)
    })
    return {"message": "Location updated"}

def update_fcm_token(uid: str, fcm_token: str):
    user_ref = db.collection("users").document(uid)

    user_ref.update({
        "fcm_token": fcm_token,
        "last_seen": datetime.now(timezone.utc)
    })

    return {"message": "FCM token updated"}

def update_user(uid: str, data: dict):
    user_ref = db.collection("users").document(uid)
    data["last_seen"] = datetime.now(timezone.utc)
    user_ref.set(data, merge=True)
    return {"message": "User updated", "data": data}