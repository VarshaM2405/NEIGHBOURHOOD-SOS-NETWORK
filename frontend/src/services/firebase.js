import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD6mabVfmz_j7gqO0aclEAsgAV4rbvpRxI",
  authDomain: "sos-network-42b37.firebaseapp.com",
  projectId: "sos-network-42b37",
  storageBucket: "sos-network-42b37.firebasestorage.app",
  messagingSenderId: "113619401945",
  appId: "1:113619401945:web:af3cd6ba40add9cda812c8",
  measurementId: "G-YZ8V2WHGB0"
};

// Initialize Firebase safely
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);

export { app, auth };
export default app;
