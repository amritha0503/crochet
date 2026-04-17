import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyANjjolXOZAX61W-xH500AUduSDW0M5i5M",
  authDomain: "crochet-stories.firebaseapp.com",
  projectId: "crochet-stories",
  storageBucket: "crochet-stories.firebasestorage.app",
  messagingSenderId: "752411955119",
  appId: "1:752411955119:web:1593de544253c31a2fe95a",
  measurementId: "G-4SVNC9V283"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
