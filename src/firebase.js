// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDnUUgdCTYpn3BqysfaPzclMX0MQARWOLg",
  authDomain: "jewellery-finance-buddy.firebaseapp.com",
  projectId: "jewellery-finance-buddy",
  storageBucket: "jewellery-finance-buddy.firebasestorage.app",
  messagingSenderId: "494454927492",
  appId: "1:494454927492:web:b3b897412a4de73cda52d1",
  measurementId: "G-38Y6PBLP52"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);