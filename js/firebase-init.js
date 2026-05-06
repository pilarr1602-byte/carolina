// js/firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { 
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, signOut, updateProfile 
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { 
  getFirestore, collection, getDocs, setDoc, doc, serverTimestamp, 
  addDoc, updateDoc, deleteDoc, query, where, orderBy, onSnapshot, getDoc
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

<<<<<<< HEAD
// Configuración fija
=======
// ========== CONFIGURACIÓN FIJA DE FIREBASE ==========
>>>>>>> 16a2f61ae5a6d5bddb3504998a8d6cd6e785f2a8
const FIXED_CONFIG = {
  apiKey: "AIzaSyDKQO1hwMnyfVKMLPbGvzPYyigNfno1WWY",
  authDomain: "sakurarestaurant1-c90a5.firebaseapp.com",
  projectId: "sakurarestaurant1-c90a5",
  storageBucket: "sakurarestaurant1-c90a5.firebasestorage.app",
  messagingSenderId: "864876802258",
  appId: "1:864876802258:web:2c767936c45e6c452afd0b"
};

let _db = null;
let _auth = null;
let _firebaseApp = null;
let _firebaseReady = false;

async function initFirebase() {
<<<<<<< HEAD
=======
  // Usar configuración fija (no preguntar)
>>>>>>> 16a2f61ae5a6d5bddb3504998a8d6cd6e785f2a8
  return await connectFirebase(FIXED_CONFIG);
}

async function connectFirebase(config) {
  try {
    _firebaseApp = initializeApp(config, 'sakura-app');
    _db = getFirestore(_firebaseApp);
    _auth = getAuth(_firebaseApp);
    
    // EXPONER GLOBALMENTE
    window.sakuraDB = _db;
    window.sakuraAuth = _auth;
    
    _firebaseReady = true;
    console.log(`✅ Firebase conectado: ${config.projectId}`);
    return true;
  } catch(e) {
    console.error('❌ Firebase error:', e);
    _firebaseReady = false;
    return false;
  }
}

const FirebaseSetup = {
  init: initFirebase,
  async quickConnect(configJson) {
    const cfg = typeof configJson === 'string' ? JSON.parse(configJson) : configJson;
    return await connectFirebase(cfg);
  },
  save() {},
  clearConfig: () => {}
};

const FirebaseState = { 
  isReady: () => _firebaseReady, 
  getDB: () => _db, 
  getAuth: () => _auth 
};
<<<<<<< HEAD

// EXPONER GLOBALMENTE
window.sakuraDB = _db;
window.FirebaseState = FirebaseState;
=======
>>>>>>> 16a2f61ae5a6d5bddb3504998a8d6cd6e785f2a8

export { 
  FirebaseSetup, FirebaseState, _db as db, _auth as auth,
  collection, getDocs, setDoc, doc, serverTimestamp, addDoc, updateDoc, deleteDoc, query, where, orderBy, onSnapshot, getDoc,
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile, onAuthStateChanged
};
<<<<<<< HEAD

=======
>>>>>>> 16a2f61ae5a6d5bddb3504998a8d6cd6e785f2a8
