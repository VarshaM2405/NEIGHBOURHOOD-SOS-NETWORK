from fastapi import APIRouter, HTTPException, Header
from app.services.auth_service import verify_firebase_token

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/verify")
def verify_user(authorization: str = Header(...)):
    try:
        # Expecting: "Bearer <token>"
        token = authorization.split(" ")[1]
        user = verify_firebase_token(token)
        return {"message": "User verified", "user": user}
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))