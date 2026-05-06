// js/auth.js - VERSIÓN CORREGIDA
import { 
  auth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, updateProfile, onAuthStateChanged, db, doc, getDoc, setDoc, serverTimestamp
} from './firebase-init.js';

let _currentUser = null;
let _currentProfile = null;

async function loadProfile(uid) {
  try {
    const snap = await getDoc(doc(db, 'usuarios', uid));
    _currentProfile = snap.exists() ? snap.data() : { nombre: _currentUser?.email?.split('@')[0] || 'Usuario', rol: 'user' };
  } catch (error) {
    _currentProfile = { nombre: _currentUser?.email?.split('@')[0] || 'Usuario', rol: 'user' };
  }
}

function translateError(code) {
  const map = {
    'auth/user-not-found': 'Correo no encontrado.',
    'auth/wrong-password': 'Contraseña incorrecta.',
    'auth/email-already-in-use': 'Este correo ya está registrado.',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
    'auth/invalid-email': 'Correo electrónico inválido.'
  };
  return map[code] || code || 'Error desconocido.';
}

function onLogin(user) {
  const name = _currentProfile?.nombre || user.email?.split('@')[0] || 'Usuario';
  const isAdmin = _currentProfile?.rol === 'admin' || user.email === 'admin@sakura.mx';

  const btnLogin = document.getElementById('btnNavLogin');
  const userMenu = document.getElementById('navUserMenu');
  const usernameSpan = document.getElementById('navUsername');
  const fab = document.getElementById('fabAdmin');
  const needLogin = document.getElementById('needLogin');
  const reservaForm = document.getElementById('reservaForm');

  if (btnLogin) btnLogin.classList.add('hidden');
  if (userMenu) userMenu.classList.remove('hidden');
  if (usernameSpan) usernameSpan.textContent = name;
  if (fab && isAdmin) fab.classList.add('show');
  if (needLogin) needLogin.classList.add('hidden');
  if (reservaForm) reservaForm.classList.remove('hidden');

  // Cargar reservaciones
  if (typeof Reservaciones !== 'undefined' && Reservaciones.loadMisReservas) {
    console.log('🔄 Cargando reservaciones para:', user.uid);
    Reservaciones.loadMisReservas(user.uid);
  }
}

function onLogout() {
  const btnLogin = document.getElementById('btnNavLogin');
  const userMenu = document.getElementById('navUserMenu');
  const fab = document.getElementById('fabAdmin');
  const needLogin = document.getElementById('needLogin');
  const reservaForm = document.getElementById('reservaForm');
  const misReservas = document.getElementById('misReservas');

  if (btnLogin) btnLogin.classList.remove('hidden');
  if (userMenu) userMenu.classList.add('hidden');
  if (fab) fab.classList.remove('show');
  if (needLogin) needLogin.classList.remove('hidden');
  if (reservaForm) reservaForm.classList.add('hidden');
  if (misReservas) misReservas.innerHTML = '<p class="empty-msg">Inicia sesión para ver tus reservaciones anteriores.</p>';
}

const Auth = {
  init() {
    onAuthStateChanged(auth, async (user) => {
      _currentUser = user;
      if (user) {
        await loadProfile(user.uid);
        onLogin(user);
      } else {
        _currentProfile = null;
        onLogout();
      }
    });
  },

  async login(email, password, isAdmin = false) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await loadProfile(cred.user.uid);
      if (isAdmin && _currentProfile?.rol !== 'admin' && email !== 'admin@sakura.mx') {
        await this.logout();
        throw new Error('No tienes permisos de administrador');
      }
      if (typeof UI !== 'undefined') {
        UI.toast(`¡Bienvenido, ${_currentProfile?.nombre || email.split('@')[0]}! 🌸`, 'ok');
        UI.hideModal('modalAuth');
      }
      return true;
    } catch(e) {
      const loginErr = document.getElementById('loginErr');
      if (loginErr) {
        loginErr.textContent = translateError(e.code);
        loginErr.classList.remove('hidden');
      }
      return false;
    }
  },

  async register(name, email, phone, password) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      await setDoc(doc(db, 'usuarios', cred.user.uid), {
        uid: cred.user.uid, nombre: name, email: email, telefono: phone || '', rol: 'user', createdAt: serverTimestamp()
      });
      await signOut(auth);
      if (typeof UI !== 'undefined') {
        if (UI.switchTab) UI.switchTab('login');
        UI.toast(`✅ ¡Cuenta creada! Ahora inicia sesión. 🌸`, 'ok');
      }
      return true;
    } catch(e) {
      const registerErr = document.getElementById('registerErr');
      if (registerErr) {
        registerErr.textContent = translateError(e.code);
        registerErr.classList.remove('hidden');
      }
      return false;
    }
  },

  async logout() {
    try {
      await signOut(auth);
      if (typeof UI !== 'undefined') UI.toast('Sesión cerrada. ¡Hasta pronto! 👋', 'info');
    } catch(e) { console.error(e); }
  },

  getUser: () => _currentUser,
  getProfile: () => _currentProfile,
  isLoggedIn: () => !!_currentUser,
  isAdmin: () => {
    const userEmail = _currentUser?.email;
    if (userEmail === 'admin@sakura.mx') return true;
    return _currentProfile?.rol === 'admin';
  }
};

// 👇 EXPONER GLOBALMENTE 👇
window.Auth = Auth;

export default Auth;