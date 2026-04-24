from firebase_admin import messaging
from app.firebase import db
from app.utils.geo import haversine_distance

def get_nearby_user_tokens(lat,lang,radius=500):
    user_ref = db.collection("users").stream()
    tokens = []

    for doc in user_ref:
        user = doc.to_dict()
        if not user.get("lat") or not user.get("lng"):
            continue
        distance = haversine_distance(lat,lang,user["lat"],user["lng"])

        if distance <= radius and user.get("fcm_token"):
            tokens.append(user["fcm_token"])

    return tokens

def send_sos_notification(tokens, alert):
    if not tokens:
        return

    message = messaging.MulticastMessage(
        tokens=tokens,
        notification=messaging.Notification(
            title="🚨 Emergency Nearby",
            body=f"{alert['category']} emergency reported near you"
        ),
        data={
            "alert_id": alert["id"],
            "type": "SOS"
        }
    )

    response = messaging.send_multicast(message)

    return {
        "success": response.success_count,
        "failure": response.failure_count
    }