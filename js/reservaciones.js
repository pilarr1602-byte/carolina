let _misReservas = [];
let _unsubRes = null;
let _dbInstance = null;

// Función para obtener la instancia de Firestore
async function getDB() {
  if (_dbInstance) return _dbInstance;
  if (window.sakuraDB) {
    _dbInstance = window.sakuraDB;
    return _dbInstance;
  }
  // Si no existe, importar Firebase manualmente
  const { initializeApp } = await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js');
  const { getFirestore } = await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js');
  const config = {
    apiKey: "AIzaSyDKQO1hwMnyfVKMLPbGvzPYyigNfno1WWY",
    authDomain: "sakurarestaurant1-c90a5.firebaseapp.com",
    projectId: "sakurarestaurant1-c90a5",
    storageBucket: "sakurarestaurant1-c90a5.firebasestorage.app",
    messagingSenderId: "864876802258",
    appId: "1:864876802258:web:2c767936c45e6c452afd0b"
  };
  const app = initializeApp(config);
  _dbInstance = getFirestore(app);
  window.sakuraDB = _dbInstance;
  return _dbInstance;
}

const Reservaciones = {
  init() {
    const form = document.getElementById('reservaForm');
    if (!form) return;
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('rDate').min = hoy;
    form.addEventListener('submit', async (e) => { 
      e.preventDefault(); 
      await this.crear(); 
    });
  },

  async crear() {
    if (!Auth.isLoggedIn()) { 
      UI.toast('Debes iniciar sesión para reservar.', 'err'); 
      return; 
    }
    
    const date = document.getElementById('rDate').value;
    const time = document.getElementById('rTime').value;
    const persons = +document.getElementById('rPersons').value;
    const area = document.getElementById('rArea').value;
    const notes = document.getElementById('rNotes').value.trim();
    
    if (!date || !time) { 
      UI.toast('Completa fecha y hora.', 'err'); 
      return; 
    }
    
    const [h] = time.split(':').map(Number);
    if (h < 12 || h > 22) {
      UI.toast('Horario disponible: 12:00 – 22:00 hrs.', 'err');
      return;
    }
    
    const btn = document.getElementById('btnReservar');
    btn.disabled = true;
    btn.textContent = '⏳ Procesando...';
    
    try {
      const db = await getDB();
      const { collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js');
      const user = Auth.getUser();
      const profile = Auth.getProfile();
      const [h, m] = time.split(':').map(Number);
      const salida = `${String(h + 3).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      
      await addDoc(collection(db, 'reservaciones'), {
        uid: user.uid,
        nombre: profile?.nombre || user.email,
        email: user.email,
        telefono: profile?.telefono || '',
        fecha: date,
        horaEntrada: time,
        horaSalida: salida,
        personas: persons,
        area: area,
        notas: notes,
        estado: 'pendiente',
        checkIn: false,
        checkOut: false,
        createdAt: serverTimestamp(),
      });
      
      UI.toast('¡Reservación creada! Esperando confirmación del administrador 🌸', 'ok');
      document.getElementById('reservaForm').reset();
      document.getElementById('rDate').min = new Date().toISOString().split('T')[0];
      await this.loadMisReservas(user.uid);
    } catch(e) { 
      UI.toast('Error: ' + e.message, 'err'); 
    } finally { 
      btn.disabled = false; 
      btn.textContent = '✓ Confirmar Reservación'; 
    }
  },

  async loadMisReservas(uid) {
    try {
      const db = await getDB();
      const { collection, query, where, orderBy, onSnapshot } = await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js');
      
      if (_unsubRes) _unsubRes();
      
      let q;
      if (Auth.isAdmin()) {
        console.log('👑 Modo Admin: Cargando TODAS las reservaciones');
        q = query(collection(db, 'reservaciones'), orderBy('fecha', 'desc'));
      } else {
        console.log('👤 Modo Usuario: Cargando solo mis reservaciones');
        q = query(collection(db, 'reservaciones'), where('uid', '==', uid), orderBy('fecha', 'desc'));
      }
      
      _unsubRes = onSnapshot(q, (snap) => { 
        _misReservas = snap.docs.map(d => ({ id: d.id, ...d.data() })); 
        this._renderMisReservas(_misReservas);
      });
      
    } catch(e) { 
      console.warn('No se pudieron cargar reservaciones:', e);
    }
  },

  _renderMisReservas(items) {
    const el = document.getElementById('misReservas');
    if (!el) return;
    
    const isAdmin = Auth.isAdmin();
    const hoy = new Date().toISOString().split('T')[0];
    
    if (!items.length) {
      if (isAdmin) {
        el.innerHTML = '<p class="empty-msg">📭 No hay reservaciones de ningún usuario.</p>';
      } else {
        el.innerHTML = '<p class="empty-msg">📭 Aún no tienes reservaciones. ¡Haz tu primera reserva!</p>';
      }
      return;
    }
    
    let adminTitle = '';
    if (isAdmin) {
      adminTitle = `<div style="background: #d9556b10; padding: 0.75rem; border-radius: 12px; margin-bottom: 1rem; border-left: 4px solid #d9556b;">
        <strong>👑 Modo Administrador</strong><br>
        <small style="color: var(--muted);">Estás viendo TODAS las reservaciones de todos los usuarios.</small>
      </div>`;
    }
    
    el.innerHTML = adminTitle + items.map(r => {
      const isPast = r.fecha < hoy;
      const isPending = r.estado === 'pendiente';
      const isConfirmed = r.estado === 'confirmada';
      const isCancelled = r.estado === 'cancelada';
      
      let statusTx = '';
      let statusBg = '';
      
      if (isPending) {
        statusTx = '⏳ PENDIENTE';
        statusBg = '#f39c12';
      } else if (isConfirmed && !isPast) {
        statusTx = '✓ CONFIRMADA';
        statusBg = '#27ae60';
      } else if (isConfirmed && isPast) {
        statusTx = '◉ COMPLETADA';
        statusBg = '#7f8c8d';
      } else if (isCancelled) {
        statusTx = '✗ CANCELADA';
        statusBg = '#e74c3c';
      }
      
      const areaIcon = r.area === 'fumar' ? '🚬' : '🚭';
      
      const clienteHtml = isAdmin ? `
        <div style="font-size: 0.75rem; color: #d9556b; margin-bottom: 0.3rem;">
          👤 <strong>${r.nombre || '—'}</strong> | ${r.email || ''}
        </div>
      ` : '';
      
      let actionButtons = '';
      if (isAdmin && !isPast && !isCancelled) {
        if (isPending || isConfirmed) {
          actionButtons = `
            <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem;">
              <button class="act-btn green" onclick="Reservaciones.adminConfirmar('${r.id}')">✅ Aceptar</button>
              <button class="act-btn red" onclick="Reservaciones.adminCancelar('${r.id}')">❌ Cancelar</button>
            </div>
          `;
        }
      } else if (!isAdmin && !isPast && isPending && !isCancelled) {
        actionButtons = `
          <button class="act-btn red" onclick="Reservaciones.cancelar('${r.id}')" style="margin-top: 0.5rem;">❌ Cancelar</button>
        `;
      }
      
      return `
        <div class="res-item" style="margin-bottom: 1rem; padding: 1rem; background: white; border-radius: 16px; border-left: 4px solid ${isPending ? '#f39c12' : (isConfirmed ? '#27ae60' : '#e74c3c')};">
          ${clienteHtml}
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap;">
            <div>
              <p class="ri-date" style="font-weight: bold;">📅 ${this._formatDate(r.fecha)}</p>
              <p class="ri-meta" style="font-size: 0.8rem;">
                🕐 ${r.horaEntrada} – ${r.horaSalida} | 👥 ${r.personas} persona(s)
              </p>
              ${r.notas ? `<p class="ri-meta" style="font-size: 0.75rem;">📝 ${r.notas}</p>` : ''}
            </div>
            <div style="text-align: right;">
              <span class="ri-status" style="background: ${statusBg}; color: white; padding: 0.2rem 0.6rem; border-radius: 20px;">${statusTx}</span>
              <span class="res-area" style="margin-left: 0.5rem;">${areaIcon} ${r.area === 'fumar' ? 'Fumar' : 'No Fumar'}</span>
            </div>
          </div>
          ${actionButtons}
        </div>
      `;
    }).join('');
  },

  async cancelar(id) {
    if (!confirm('¿Cancelar esta reservación?')) return;
    try {
      const db = await getDB();
      const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js');
      await updateDoc(doc(db, 'reservaciones', id), { estado: 'cancelada' });
      UI.toast('Reservación cancelada.', 'info');
    } catch(e) { 
      UI.toast('Error al cancelar: ' + e.message, 'err'); 
    }
  },

  async adminConfirmar(id) {
    if (!Auth.isAdmin()) {
      UI.toast('No tienes permisos de administrador.', 'err');
      return;
    }
    if (!confirm('¿Confirmar esta reservación? Se enviará un ticket al cliente.')) return;
    
    try {
      const db = await getDB();
      const { doc, updateDoc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js');
      
      const reservaRef = doc(db, 'reservaciones', id);
      const reservaSnap = await getDoc(reservaRef);
      const reserva = { id: reservaSnap.id, ...reservaSnap.data() };
      
      await updateDoc(reservaRef, { estado: 'confirmada' });
      UI.toast('✅ Reservación confirmada', 'ok');
      
      if (typeof EmailService !== 'undefined') {
        await EmailService.enviarTicketPorEmail(reserva);
      }
      
    } catch(e) { 
      UI.toast('Error: ' + e.message, 'err'); 
    }
  },

  async adminCancelar(id) {
    if (!Auth.isAdmin()) {
      UI.toast('No tienes permisos de administrador.', 'err');
      return;
    }
    if (!confirm('¿Cancelar esta reservación?')) return;
    try {
      const db = await getDB();
      const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js');
      await updateDoc(doc(db, 'reservaciones', id), { estado: 'cancelada' });
      UI.toast('❌ Reservación cancelada.', 'info');
    } catch(e) { 
      UI.toast('Error: ' + e.message, 'err'); 
    }
  },

  _formatDate(dateStr) {
    const [y, m, d] = dateStr.split('-');
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${d} ${months[+m - 1]} ${y}`;
  },

  getMisReservas: () => _misReservas,
};

window.Reservaciones = Reservaciones;