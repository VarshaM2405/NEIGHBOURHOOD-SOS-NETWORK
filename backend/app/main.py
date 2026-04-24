from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import auth,users,alerts,responses
from fastapi.security import HTTPBearer

app = FastAPI(title=settings.PROJECT_NAME)

# CORS for react native
security = HTTPBearer()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root check
@app.get("/")
def root():
    return {"message": "SOS Backend is running", "security_mode": "Emergency Bypass: ACTIVE"}
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(alerts.router)
app.include_router(responses.router)

