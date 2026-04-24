from fastapi import APIRouter, Depends, HTTPException
from app.services.alert_service import (
    create_alert,
    get_nearby_alerts,
    get_alert_by_id,
    resolve_alert
)
from app.dependencies import get_current_user   

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.post("")
def post_alert(data: dict):
    # DUMMY USER FOR DEMO
    user = {"uid": data.get("posted_by_uid", "demo-user-1")} 
    print(f"DEBUG: ROUTER HIT - POST /alerts by {user.get('uid')}")
    return create_alert(user, data)

@router.get("/nearby")
def nearby_alerts(
    lat: float,
    lng: float,
    radius: int = 500
):
    print(f"DEBUG: FETCHING NEARBY - {lat}, {lng}")
    return get_nearby_alerts(lat, lng, radius)

@router.get("/{alert_id}")
def get_alert(alert_id: str):
    alert = get_alert_by_id(alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    return alert  

@router.patch("/{alert_id}/resolve")
def resolve(alert_id: str):
    result = resolve_alert(alert_id)
    if not result:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    return result