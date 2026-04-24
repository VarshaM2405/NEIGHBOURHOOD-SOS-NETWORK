from fastapi import APIRouter, Depends, HTTPException
from app.services.response_service import respond_to_alert
from app.dependencies import get_current_user

router = APIRouter(prefix="/alerts", tags=["Responses"])

@router.post("/{alert_id}/respond")
def respond(alert_id: str, data: dict = {}):
    # Dummy user for demo
    user = {"uid": data.get("uid", "demo-responder"), "name": data.get("name", "Operative Alpha")}
    result = respond_to_alert(alert_id, user)
    
    if result.get("code") != 200:
        raise HTTPException(
            status_code=result.get("code", 400), 
            detail=result.get("error", "An error occurred")
        )
        
    return {"message": result["message"]}