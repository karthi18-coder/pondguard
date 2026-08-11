// ==========================================
// PONDGUARDIAN FIREBASE CONFIG
// ==========================================

import { initializeApp } from
"https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import { getAuth } from
"https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import { getFirestore } from
"https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// Firebase configuration

const firebaseConfig = {
    apiKey: "AIzaSyAg_-1Zvv_vluxPmfd2s2m2RMX5CjAXr7M",
    authDomain: "pondguardian-b4808.firebaseapp.com",
    projectId: "pondguardian-b4808",
    storageBucket: "pondguardian-b4808.firebasestorage.app",
    messagingSenderId: "756994004617",
    appId: "1:756994004617:web:74df8a68de9e9b8e825858",
    measurementId: "G-N3Y1HZN33S"
};


// Initialize Firebase

const app = initializeApp(firebaseConfig);


// Authentication

const auth = getAuth(app);


// Firestore

const db = getFirestore(app);


// Export

export {
    app,
    auth,
    db
};
