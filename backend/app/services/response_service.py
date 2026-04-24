from app.firebase import db
from datetime import datetime, timezone

def respond_to_alert(alert_id: str, user: dict):
    try:
        doc_ref = db.collection("alerts").document(alert_id)
        doc = doc_ref.get()

        if not doc.exists:
            return {"code": 404, "error": "Alert not found"}

        data = doc.to_dict()

        # Prevent self-response logic (bypassable for demo if needed)
        if data.get("posted_by_uid") == user.get("uid"):
             return {"code": 403, "error": "You cannot respond to your own alert"}

        if data.get("status") in ["responding", "resolved"]:
            return {"code": 400, "error": "Alert already has a responder or is resolved"}
        
        responder_name = user.get("name")
        if not responder_name:
            responder_name = user.get("phone") or "Volunteer"

        update_data = {
            "status": "responding",
            "responder_uid": user.get("uid"),
            "responder_name": responder_name,
            "responded_at": datetime.now(timezone.utc)
        }
        
        doc_ref.update(update_data)
        return {"code": 200, "message": "You are now responding"}
    except Exception as e:
        print("Response Error:", e)
        return {"code": 500, "error": str(e)}