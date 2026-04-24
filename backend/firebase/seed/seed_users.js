const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Path to your service account key

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

const users = [
  {
    uid: "user_01",
    name: "John Doe",
    email: "john@example.com",
    lat: 12.9716,
    lng: 77.5946,
    fcm_token: "token_01",
    last_seen: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    uid: "user_02",
    name: "Jane Smith",
    email: "jane@example.com",
    lat: 12.9720,
    lng: 77.5950,
    fcm_token: "token_02",
    last_seen: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    uid: "user_03",
    name: "Bob Wilson",
    email: "bob@example.com",
    lat: 12.9710,
    lng: 77.5940,
    fcm_token: "token_03",
    last_seen: admin.firestore.FieldValue.serverTimestamp()
  }
];

async function seedUsers() {
  for (const user of users) {
    await db.collection('users').document(user.uid).set(user);
    console.log(`Seeded user: ${user.name}`);
  }
  console.log('User seeding complete.');
}

seedUsers().catch(console.error);
