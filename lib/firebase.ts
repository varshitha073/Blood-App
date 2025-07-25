import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// Your Firebase configuration
// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD4knHL1Hiyt50S9YiowDq2tgTT1Jf7CgU",
  authDomain: "blood-app-fabef.firebaseapp.com",
  databaseURL: "https://blood-app-fabef-default-rtdb.firebaseio.com",
  projectId: "blood-app-fabef",
  storageBucket: "blood-app-fabef.firebasestorage.app",
  messagingSenderId: "979285906729",
  appId: "1:979285906729:web:3dfe0b1951041cce5e5338",
  measurementId: "G-J4JTHR6ZCF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app)

export default app
