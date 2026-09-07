import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDKDBkruxepuRR6zMMZdTGX0X-KF1yfuvo",
  authDomain: "food-84188.firebaseapp.com",
  projectId: "food-84188",
  storageBucket: "food-84188.firebasestorage.app",
  messagingSenderId: "476560005208",
  appId: "1:476560005208:web:b1a3e56f8564cf22c4d22d"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };
