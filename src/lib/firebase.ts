import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';


const firebaseConfig = {
  apiKey: "AIzaSyBcefWV-uYaSv6cSe7Uxyr7B5HYyU1ENJw",
  authDomain: "englishwordlearning-d636b.firebaseapp.com",
  projectId: "englishwordlearning-d636b",
  storageBucket: "englishwordlearning-d636b.firebasestorage.app",
  messagingSenderId: "1013792565434",
  appId: "1:1013792565434:web:08da58bb8962bdbcef3a83",
  measurementId: "G-SB9EHLH8KC"
};

const app = initializeApp(firebaseConfig);

// Firebase サービスのインスタンスをエクスポート
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// デフォルトエクスポート
export default app;
