import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { 
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, signOut, updateProfile 
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { 
  getFirestore, collection, getDocs, setDoc, doc, serverTimestamp, 
  addDoc, updateDoc, deleteDoc, query, where, orderBy, onSnapshot, getDoc
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

let _db = null;
let _auth = null;
let _firebaseApp = null;
let _firebaseReady = false;

// Configuración fija de Firebase (para que no pida conectar nunca)
const FIXED_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDKQO1hwMnyfVKMLPbGvzPYyigNfno1WWY",
  authDomain: "sakurarestaurant1-c90a5.firebaseapp.com",
  projectId: "sakurarestaurant1-c90a5",
  storageBucket: "sakurarestaurant1-c90a5.firebasestorage.app",
  messagingSenderId: "864876802258",
  appId: "1:864876802258:web:2c767936c45e6c452afd0b"
};

async function initFirebase() {
  // Usar configuración fija, no pedir wizard
  return await connectFirebase(FIXED_FIREBASE_CONFIG);
}

async function connectFirebase(config) {
  try {
    _firebaseApp = initializeApp(config, 'sakura-app');
    _db = getFirestore(_firebaseApp);
    _auth = getAuth(_firebaseApp);
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

function saveConfig(config) { localStorage.setItem('sakura_fb_config', JSON.stringify(config)); }
function loadConfig() { try { const raw = localStorage.getItem('sakura_fb_config'); return raw ? JSON.parse(raw) : null; } catch { return null; } }

const FirebaseSetup = {
  init: initFirebase,
  async quickConnect(configJson) {
    try {
      const cfg = typeof configJson === 'string' ? JSON.parse(configJson) : configJson;
      saveConfig(cfg);
      const ok = await connectFirebase(cfg);
      if (ok) {
        document.getElementById('fbSetupOverlay')?.classList.add('hidden');
        window.location.reload();
      }
      return ok;
    } catch(e) { console.error(e); return false; }
  },
  async save() {
    const textarea = document.getElementById('fbConfigInput');
    const msgEl = document.getElementById('fbSetupMsg');
    try {
      const cfg = JSON.parse(textarea.value.trim());
      msgEl.textContent = '⏳ Conectando...';
      const ok = await this.quickConnect(cfg);
      if (ok) {
        msgEl.textContent = '✅ Conectado! Recargando...';
        msgEl.className = 'fb-msg ok';
      } else throw new Error('No se pudo conectar');
    } catch(e) {
      msgEl.textContent = '❌ Config inválida: ' + e.message;
      msgEl.className = 'fb-msg err';
    }
  },
  clearConfig: () => { localStorage.removeItem('sakura_fb_config'); window.location.reload(); }
};

const FirebaseState = { isReady: () => _firebaseReady, getDB: () => _db, getAuth: () => _auth };

export { 
  FirebaseSetup, FirebaseState, _db as db, _auth as auth,
  collection, getDocs, setDoc, doc, serverTimestamp, addDoc, updateDoc, deleteDoc, query, where, orderBy, onSnapshot, getDoc,
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile, onAuthStateChanged
};