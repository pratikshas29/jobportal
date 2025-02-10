import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAbS9tDVXWCJ-uU5XMWvrKIOQXYQoOE0LA",
    authDomain: "jobportal-f2ce3.firebaseapp.com",
    projectId: "jobportal-f2ce3",
    storageBucket: "jobportal-f2ce3.appspot.com",  // You can keep the storage bucket if you still want it in your config
    messagingSenderId: "486150924104",
    appId: "1:486150924104:web:cd05a774d8760be36c357d",
    measurementId: "G-7D7R5C544G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db };


