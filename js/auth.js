/* ══════════════════════════════════════════════════════
   AUTH.JS — Módulo de Autenticación
   Login / Register / Logout · Roles: user | admin
   ══════════════════════════════════════════════════════ */

'use strict';

let _currentUser   = null;
let _currentProfile= null;

const Auth = {

  init() {
    if (!FirebaseState.isReady()) return;

    import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js')
      .then(({ onAuthStateChanged }) => {
        onAuthStateChanged(window.sakuraAuth, async (user) => {
          _currentUser = user;
          if (user) {
            await this._loadProfile(user.uid);
            this._onLogin(user);
          } else {
            _currentProfile = null;
            this._onLogout();
          }
        });
      });
  },

  /* ── LOGIN ── */
  async login(email, password, isAdmin = false) {
    try {
      const { signInWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js');
      const cred = await signInWithEmailAndPassword(window.sakuraAuth, email, password);

      await this._loadProfile(cred.user.uid);
      if (isAdmin && _currentProfile?.rol !== 'admin') {
        await this.logout();
        throw new Error('Esta cuenta no tiene permisos de administrador.');
      }

      UI.toast(`¡Bienvenido, ${_currentProfile?.nombre || email}! 🌸`, 'ok');
      UI.hideModal('modalAuth');
      return true;

    } catch(e) {
      const msg = this._translateError(e.code || e.message);
      const loginErr = document.getElementById('loginErr');
      if (loginErr) {
        loginErr.textContent = msg;
        loginErr.classList.remove('hidden');
      }
      return false;
    }
  },

  /* ── REGISTER (SOLO CREA CUENTA, NO INICIA SESIÓN) ── */
  async register(name, email, phone, password) {
    try {
      const { createUserWithEmailAndPassword, updateProfile, signOut } =
        await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js');
      const { setDoc, doc, serverTimestamp } =
        await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');

      // 1. Crear usuario en Authentication
      const cred = await createUserWithEmailAndPassword(window.sakuraAuth, email, password);
      
      // 2. Actualizar perfil con nombre
      await updateProfile(cred.user, { displayName: name });

      // 3. Crear documento en Firestore (colección "usuarios")
      await setDoc(doc(window.sakuraDB, 'usuarios', cred.user.uid), {
        uid:       cred.user.uid,
        nombre:    name,
        email:     email,
        telefono:  phone || '',
        rol:       'user',
        createdAt: serverTimestamp(),
      });

      // 4. CERRAR SESIÓN (para que no quede logueado automáticamente)
      await signOut(window.sakuraAuth);
      _currentUser = null;
      _currentProfile = null;

      // 5. Cambiar a la pestaña de LOGIN
      if (typeof UI !== 'undefined' && UI.switchTab) {
        UI.switchTab('login');
      }

      // 6. Limpiar el formulario de registro
      const registerForm = document.getElementById('registerForm');
      if (registerForm) registerForm.reset();

      UI.toast(`✅ ¡Cuenta creada exitosamente! Ahora inicia sesión. 🌸`, 'ok');
      return true;

    } catch(e) {
      console.error('❌ Error en registro:', e);
      const msg = this._translateError(e.code || e.message);
      const registerErr = document.getElementById('registerErr');
      if (registerErr) {
        registerErr.textContent = msg;
        registerErr.classList.remove('hidden');
      }
      return false;
    }
  },

  /* ── LOGOUT ── */
  async logout() {
    try {
      const { signOut } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js');
      await signOut(window.sakuraAuth);
      UI.toast('Sesión cerrada. ¡Hasta pronto! 👋', 'info');
    } catch(e) { console.error(e); }
  },

  /* ── Cargar perfil de Firestore ── */
  async _loadProfile(uid) {
    try {
      const { getDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
      const snap = await getDoc(doc(window.sakuraDB, 'usuarios', uid));
      _currentProfile = snap.exists() ? snap.data() : { nombre: _currentUser?.email, rol: 'user' };
    } catch {
      _currentProfile = { nombre: _currentUser?.email, rol: 'user' };
    }
  },

  /* ── Callbacks de estado ── */
  _onLogin(user) {
    const name = _currentProfile?.nombre || user.email;
    const isAdmin = _currentProfile?.rol === 'admin';

    const btnLogin = document.getElementById('btnNavLogin');
    const userMenu = document.getElementById('navUserMenu');
    const usernameSpan = document.getElementById('navUsername');
    const fab = document.getElementById('fabAdmin');
    const needLogin = document.getElementById('needLogin');
    const reservaForm = document.getElementById('reservaForm');

    if (btnLogin) btnLogin.classList.add('hidden');
    if (userMenu) userMenu.classList.remove('hidden');
    if (usernameSpan) usernameSpan.textContent = name.split(' ')[0];
    if (fab && isAdmin) fab.classList.add('show');
    if (needLogin) needLogin.classList.add('hidden');
    if (reservaForm) reservaForm.classList.remove('hidden');

    Reservaciones.loadMisReservas(user.uid);
  },

  _onLogout() {
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
  },

  /* ── Helpers públicos ── */
  getUser:      () => _currentUser,
  getProfile:   () => _currentProfile,
  isLoggedIn:   () => !!_currentUser,
  
  isAdmin: () => {
    const userEmail = _currentUser?.email;
    if (userEmail === 'admin@sakura.mx') return true;
    return _currentProfile?.rol === 'admin';
  },

  _translateError(code) {
    const map = {
      'auth/user-not-found':       'Correo no encontrado.',
      'auth/wrong-password':       'Contraseña incorrecta.',
      'auth/email-already-in-use': 'Este correo ya está registrado.',
      'auth/weak-password':        'La contraseña debe tener al menos 6 caracteres.',
      'auth/invalid-email':        'Correo electrónico inválido.',
      'auth/too-many-requests':    'Demasiados intentos. Espera un momento.',
      'auth/network-request-failed':'Sin conexión. Verifica tu red.',
    };
    return map[code] || code || 'Error desconocido. Inténtalo de nuevo.';
  },
};