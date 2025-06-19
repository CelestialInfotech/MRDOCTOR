import { initializeApp, getApps } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyBmsqryNtHuDxdR4UchfEqPRfnAWc55vB0",
  authDomain: "mrdoctor2025.firebaseapp.com",
  projectId: "mrdoctor2025",
  storageBucket: "mrdoctor2025.firebasestorage.app",
  messagingSenderId: "301010924786",
  appId: "1:301010924786:web:b2f55b9e61be099c2ccc6b",
  measurementId: "G-QHPQTJRXZZ"
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const db = getFirestore(app)
const auth = getAuth(app)

export { db, auth }
