from app.firebase import db
from datetime import datetime, timezone
from app.utils.geo import haversine_distance
from app.services.fcm_service import get_nearby_user_tokens, send_sos_notification


def create_alert(user, data):
    try:
        doc_ref = db.collection("alerts").document()

        alert = {
            "id": doc_ref.id,
            "posted_by_uid": user["uid"],
            "posted_at": data.get("posted_at", None), # CAPTURE FROM FRONTEND
            "category": data["category"],
            "description": data.get("description", ""),
            "lat": data["lat"],
            "lng": data["lng"],
            "status": "active",
            "image": data.get("image", None),
            "address": data.get("address", "GPS VERIFIED"),
            "responder_uid": None,
            "responder_name": None,
            "created_at": datetime.now(timezone.utc),
            "responded_at": None,
            "resolved_at": None
        }

        print(f"DEBUG: SOS BROADCAST RECEIVED - {alert['category']}")
        doc_ref.set(alert)
        try:
            tokens = get_nearby_user_tokens(alert["lat"], alert["lng"])
            if tokens:   # avoid empty list crash
                send_sos_notification(tokens, alert)
        except Exception as e:
            print("Notification failed:", e)

        return alert

    except Exception as e:
        print("ERROR IN CREATE ALERT:", e)
        raise e

def get_nearby_alerts(lat, lng, radius=500):
    alerts_ref = db.collection("alerts")
    docs = alerts_ref.stream()

    nearby = []

    for doc in docs:
        data = doc.to_dict()

        # Date parsing for frontend
        if "created_at" in data and hasattr(data["created_at"], "isoformat"):
            data["created_at"] = data["created_at"].isoformat()
        if "responded_at" in data and data["responded_at"] and hasattr(data["responded_at"], "isoformat"):
            data["responded_at"] = data["responded_at"].isoformat()
        if "resolved_at" in data and data["resolved_at"] and hasattr(data["resolved_at"], "isoformat"):
            data["resolved_at"] = data["resolved_at"].isoformat()

        # GPS Verification
        if not data.get("lat") or not data.get("lng"):
            continue
            
        data["lat"] = float(data["lat"])
        data["lng"] = float(data["lng"])
        data["distance"] = 0 # Ignored for demo
        nearby.append(data)

    return nearby

def get_alert_by_id(alert_id):
    doc = db.collection("alerts").document(alert_id).get()

    if not doc.exists:
        return None

    return doc.to_dict()

def resolve_alert(alert_id):
    ref = db.collection("alerts").document(alert_id)
    doc = ref.get()

    if not doc.exists:
        return None

    ref.update({
        "status": "resolved",
        "resolved_at": datetime.now(timezone.utc)
    })

    return {"message": "Alert resolved"}