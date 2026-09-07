import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDKDBkruxepuRR6zMMZdTGX0X-KF1yfuvo",
  authDomain: "food-84188.firebaseapp.com",
  projectId: "food-84188",
  storageBucket: "food-84188.firebasestorage.app",
  messagingSenderId: "476560005208",
  appId: "1:476560005208:web:b1a3e56f8564cf22c4d22d",
  measurementId: "G-R53GE9MFGT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

