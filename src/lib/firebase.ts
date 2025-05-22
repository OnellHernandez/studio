import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import type { Firestore } from "firebase/firestore";
// import { getDatabase } from "firebase/database"; // Uncomment if using Realtime Database

// Validate environment variables
const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const firebaseAuthDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const firebaseStorageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const firebaseMessagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const firebaseAppId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
// const firebaseDatabaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL; // Uncomment if using Realtime Database



if (!firebaseApiKey || !firebaseAuthDomain || !firebaseProjectId || !firebaseStorageBucket || !firebaseMessagingSenderId || !firebaseAppId) {
    console.error("Firebase environment variables are missing or incomplete. Check your .env file or environment configuration and ensure all NEXT_PUBLIC_FIREBASE_ variables are set correctly.");
    // Optionally throw an error during build or runtime in development
    // if (process.env.NODE_ENV === 'development') {
    //   throw new Error("Firebase environment variables are missing or incomplete.");
    // }
} else {
    console.log("Firebase environment variables loaded."); // Added log for debugging
}


const firebaseConfig: FirebaseOptions = {
  apiKey: firebaseApiKey,
  authDomain: firebaseAuthDomain,
  projectId: firebaseProjectId,
  storageBucket: firebaseStorageBucket,
  messagingSenderId: firebaseMessagingSenderId,
  appId: firebaseAppId,
  // databaseURL: firebaseDatabaseURL, // Uncomment if using Realtime Database
};

// Initialize Firebase
let app;
if (!getApps().length) {
    try {
        app = initializeApp(firebaseConfig);
        console.log("Firebase app initialized successfully."); // Added log
    } catch (error) {
        console.error("Firebase initialization error:", error);
        // Handle initialization error appropriately, maybe show a message to the user
        // or prevent the app from proceeding without Firebase.
        throw error; // Rethrow or handle as needed
    }
} else {
    app = getApp();
    console.log("Firebase app already initialized."); // Added log
}


let auth;
let db: Firestore;

// let rtdb; // Uncomment if using Realtime Database

try {
    auth = getAuth(app);
    db = getFirestore(app);
    // rtdb = getDatabase(app); // Uncomment if using Realtime Database
    console.log("Firebase Auth and Firestore services retrieved."); // Added log
} catch (error) {
    console.error("Error getting Firebase services:", error);
    // Handle service retrieval error
}


export { app, auth, db }; // Add rtdb here if using Realtime Database
