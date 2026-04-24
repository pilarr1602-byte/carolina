let _db = null;
let _auth = null;
let _firebaseApp = null;
let _firebaseReady = false;

const FirebaseSetup = {
  async init() {
    const saved = this._loadConfig();
    if (!saved) {
      console.log('%c🔥 SAKURA — Firebase Setup', 'font-size:16px;color:#d9556b;font-weight:bold');
      console.log('%cUsa el wizard en pantalla o ejecuta:', 'color:#4d7a38');
      console.log('FirebaseSetup.quickConnect(JSON.stringify({apiKey:"...",authDomain:"...",projectId:"..."}))');
      document.getElementById('fbSetupOverlay')?.classList.remove('hidden');
      return false;
    }
    return await this._connect(saved);
  },

  async quickConnect(configJson) {
    try {
      const cfg = typeof configJson === 'string' ? JSON.parse(configJson) : configJson;
      this._saveConfig(cfg);
      const ok = await this._connect(cfg);
      if (ok) {
        console.log('%c✅ Firebase conectado!', 'color:#4d7a38;font-weight:bold');
        document.getElementById('fbSetupOverlay')?.classList.add('hidden');
        window.location.reload();
      }
      return ok;
    } catch(e) {
      console.error('Error:', e);
      return false;
    }
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
      } else throw new Error('Error');
    } catch(e) {
      msgEl.textContent = '❌ Config inválida: ' + e.message;
      msgEl.className = 'fb-msg err';
    }
  },

  async _connect(config) {
    try {
      const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
      const { getFirestore, collection, getDocs, setDoc, doc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
      const { getAuth } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js');

      _firebaseApp = initializeApp(config, 'sakura-app');
      _db = getFirestore(_firebaseApp);
      _auth = getAuth(_firebaseApp);

      window.sakuraDB = _db;
      window.sakuraAuth = _auth;
      window.sakuraFire = { collection, getDocs, setDoc, doc, serverTimestamp };

      _firebaseReady = true;
      await this._seedCollections(_db, { collection, getDocs, setDoc, doc, serverTimestamp });
      return true;
    } catch(e) {
      console.error('Firebase init error:', e);
      _firebaseReady = false;
      return false;
    }
  },

  async _seedCollections(db, { collection, getDocs, setDoc, doc, serverTimestamp }) {
    try {
      const menuSnap = await getDocs(collection(db, 'menu'));
      if (menuSnap.empty) {
        console.log('📋 Creando colección "menu"...');
        for (const item of MENU_DATA) {
          await setDoc(doc(db, 'menu', item.id), { ...item, disponible: true, createdAt: serverTimestamp() });
        }
      }
    } catch(e) { console.warn('Seed error:', e); }
  },

  _saveConfig(cfg) { localStorage.setItem('sakura_fb_config', JSON.stringify(cfg)); },
  _loadConfig() { try { const raw = localStorage.getItem('sakura_fb_config'); return raw ? JSON.parse(raw) : null; } catch { return null; } },
  clearConfig() { localStorage.removeItem('sakura_fb_config'); window.location.reload(); },
};

const FirebaseState = { isReady: () => _firebaseReady, getDB: () => _db, getAuth: () => _auth };