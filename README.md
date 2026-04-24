# 🛡️ Neighbourhood SOS Network
**A Hyperlocal Emergency Response & Community Safety Grid**

![Project Banner](https://img.shields.io/badge/Status-Live_Pulse_Active-red?style=for-the-badge&logo=firebase)
![Platform](https://img.shields.io/badge/Platform-iOS_|_Android-blue?style=for-the-badge&logo=apple)
![Tech](https://img.shields.io/badge/Built_With-FastAPI_|_React_Native-success?style=for-the-badge&logo=fastapi)

## 📌 Overview
The **Neighbourhood SOS Network** is a mission-critical emergency response platform designed to bridge the gap between an incident and the arrival of official services. By turning community members into a coordinated safety grid, the network ensures that the closest help—your neighbor—is alerted and empowered to act in seconds.

Designed with a high-stakes **Secure Terminal aesthetic**, the app provides real-time situational awareness and rapid response coordination.

---

## 🚀 Key Features

### 📡 Live Pulse SOS
Instantly broadcast an emergency signal to all nearby "Operatives" (verified community members). Signals are GPS-verified and transmitted with zero latency.

### 🗺️ Tactical Map Interface
A real-time visualization of the neighborhood safety grid.
- **Active Alerts**: Visualized as high-priority pulses on the map.
- **Responder Tracking**: See the real-time status of volunteers moving toward an incident.
- **Environmental Awareness**: Identify hotspots and community notices at a glance.

### ⏱️ Temporal Tracking
Full lifecycle monitoring for every incident:
- **Origin Pulse**: Precise timestamp when the SOS was triggered.
- **Response Phase**: Tracking when a neighbor accepts the call to help.
- **Resolution**: Final log of when the situation was stabilized.

### 🛡️ Self-Response Shield
Smart synchronization logic ensures that the user who raised the alert is shielded from notification loops, ensuring a professional and focused response environment.

---

## 🏗️ Tech Stack

### Frontend (Mobile App)
- **Framework**: React Native (Expo)
- **State Management**: Zustand (High-performance store)
- **Maps**: React Native Maps with custom styling.
- **Navigation**: React Navigation (Native Stack)
- **Auth**: Firebase Phone Authentication for verified IDs.

### Backend (Server)
- **Framework**: FastAPI (Python) - Asynchronous & High-Performance.
- **Database**: Firebase Firestore (Real-time NoSQL).
- **Notifications**: Firebase Cloud Messaging (FCM).
- **Geolocation**: Haversine distance calculations for hyperlocal precision.

---

## 🛠️ Setup & Installation

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npx expo start
```

### 3. Environment Configuration
Ensure you have a `.env` file in both directories:
- **Backend**: Requires `FIREBASE_CREDENTIALS` (serviceAccountKey.json).
- **Frontend**: Requires Firebase config keys and API base URL.

---

## 🎯 The Vision
In an emergency, every second counts. While official services are on the way, the **Neighbourhood SOS Network** ensures no one is alone. We are transforming passive urban environments into active, resilient safety grids.

**Authorized Personnel Only.**
*System activities are monitored in real-time.*
