import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyDnUUgdCTYpn3BqysfaPzclMX0MQARWOLg",
  authDomain: "jewellery-finance-buddy.firebaseapp.com",
  projectId: "jewellery-finance-buddy",
  storageBucket: "jewellery-finance-buddy.firebasestorage.app",
  messagingSenderId: "494454927492",
  appId: "1:494454927492:web:b3b897412a4de73cda52d1",
  measurementId: "G-38Y6PBLP52"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);