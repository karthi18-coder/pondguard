// Firebase App
import { initializeApp } 
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

// Firebase Authentication
import { getAuth } 
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

// Firebase Firestore
import { getFirestore } 
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ==========================================
// PONDGUARDIAN FIREBASE CONFIGURATION
// ==========================================

const firebaseConfig = {
    apiKey: "AIzaSyAg_-1Zvv_vluxPmfd2s2mRMX5CjAXr7M",
    authDomain: "pondguardian-b4808.firebaseapp.com",
    projectId: "pondguardian-b4808",
    storageBucket: "pondguardian-b4808.firebasestorage.app",
    messagingSenderId: "756994004617",
    appId: "1:756994004617:web:74df8a68de9e9b8e825858",
    measurementId: "G-N3Y1HZN33S"
};


// ==========================================
// INITIALIZE FIREBASE
// ==========================================

const app = initializeApp(firebaseConfig);


// ==========================================
// INITIALIZE AUTHENTICATION
// ==========================================

const auth = getAuth(app);


// ==========================================
// INITIALIZE FIRESTORE DATABASE
// ==========================================

const db = getFirestore(app);


// ==========================================
// EXPORT
// ==========================================

export {
    app,
    auth,
    db
};
