import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "bodik-75ffc.firebaseapp.com",
  databaseURL:
    "https://bodik-75ffc-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "bodik-75ffc",
  storageBucket: "bodik-75ffc.appspot.com",
  messagingSenderId: "904451021821",
  appId: "1:904451021821:web:b1b6606a4d38a6c1941794",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Realtime Database
export const DATABASE = getDatabase(app);
export const RD_PROJECT_ITEMS = "/app_ttcc/items/";
export const RD_PROJECT_USERS = "/app_ttcc/users/";
