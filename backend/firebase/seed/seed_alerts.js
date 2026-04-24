const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

const alerts = [
  {
    posted_by_uid: "user_01",
    category: "Medical",
    description: "Heart attack suspected, need immediate help.",
    lat: 12.9716,
    lng: 77.5946,
    status: "active",
    responder_uid: null,
    responder_name: null,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    responded_at: null,
    resolved_at: null
  },
  {
    posted_by_uid: "user_02",
    category: "Fire",
    description: "Kitchen fire spreading.",
    lat: 12.9725,
    lng: 77.5955,
    status: "active",
    responder_uid: null,
    responder_name: null,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    responded_at: null,
    resolved_at: null
  },
  {
    posted_by_uid: "user_03",
    category: "Security",
    description: "Suspicious activity near main gate.",
    lat: 12.9710,
    lng: 77.5940,
    status: "resolved",
    responder_uid: "user_01",
    responder_name: "John Doe",
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    responded_at: admin.firestore.FieldValue.serverTimestamp(),
    resolved_at: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    posted_by_uid: "user_01",
    category: "Accident",
    description: "Minor road accident, need first aid.",
    lat: 12.9730,
    lng: 77.5960,
    status: "active",
    responder_uid: null,
    responder_name: null,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    responded_at: null,
    resolved_at: null
  }
];

async function seedAlerts() {
  for (const alert of alerts) {
    const docRef = db.collection('alerts').doc();
    await docRef.set({ ...alert, id: docRef.id });
    console.log(`Seeded alert: ${alert.category}`);
  }
  console.log('Alert seeding complete.');
}

seedAlerts().catch(console.error);
