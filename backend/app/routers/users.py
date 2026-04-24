from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from app.services.user_service import get_user, update_location, update_fcm_token, update_user
from app.services.auth_service import verify_firebase_token

router = APIRouter(prefix="/users", tags=["Users"])

class LocationUpdate(BaseModel):
    lat: float
    lng: float

class FCMTokenUpdate(BaseModel):
    fcm_token: str

def get_current_user(authorization: str = Header(...)):
    token = authorization.split(" ")[1]
    return verify_firebase_token(token)

@router.get("/me")
def get_me(user=Depends(get_current_user)):
    data = get_user(user["uid"])
    if not data:
        raise HTTPException(status_code=404, detail="User not found")
    return data

@router.patch("/me")
def update_me(data: dict, user=Depends(get_current_user)):
    return update_user(user["uid"], data)

@router.patch("/location")
def update_user_location(data: LocationUpdate, user=Depends(get_current_user)):
    return update_location(user["uid"], data.lat, data.lng)

@router.post("/fcm-token")
def update_token(data: FCMTokenUpdate, user=Depends(get_current_user)):
    return update_fcm_token(user["uid"], data.fcm_token)