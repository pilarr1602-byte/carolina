// reservaciones.js - VERSIÓN QUE FUNCIONA
let _misReservas = [];

const Reservaciones = {
  init() {
    const form = document.getElementById('reservaForm');
    if (!form) return;
    const hoy = new Date().toISOString().split('T')[0];
    const fechaInput = document.getElementById('rDate');
    if (fechaInput) fechaInput.min = hoy;
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.crear();
    });
    
    console.log('✅ Reservaciones iniciado');
  },

  async crear() {
    if (!Auth.isLoggedIn()) {
      UI.toast('Debes iniciar sesión para reservar.', 'err');
      return;
    }
    
    const date = document.getElementById('rDate').value;
    const time = document.getElementById('rTime').value;
    const persons = document.getElementById('rPersons').value;
    const area = document.getElementById('rArea').value;
    const notes = document.getElementById('rNotes').value;
    
    if (!date || !time) {
      UI.toast('Completa fecha y hora.', 'err');
      return;
    }
    
    const btn = document.getElementById('btnReservar');
    btn.disabled = true;
    btn.textContent = '⏳ Procesando...';
    
    try {
      const user = Auth.getUser();
      const profile = Auth.getProfile();
      const [h, m] = time.split(':').map(Number);
      const salida = `${String(h + 3).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      
      const { collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js');
      await addDoc(collection(window.sakuraDB, 'reservaciones'), {
        uid: user.uid,
        nombre: profile?.nombre || user.email.split('@')[0],
        email: user.email,
        fecha: date,
        horaEntrada: time,
        horaSalida: salida,
        personas: parseInt(persons),
        area: area,
        notas: notes,
        estado: 'pendiente',
        createdAt: serverTimestamp()
      });
      
      UI.toast('✅ Reservación creada. Espera confirmación.', 'ok');
      document.getElementById('reservaForm').reset();
      
      // Recargar reservaciones
      await this.loadMisReservas(user.uid);
      
    } catch(e) {
      console.error('Error al crear:', e);
      UI.toast('Error: ' + e.message, 'err');
    } finally {
      btn.disabled = false;
      btn.textContent = '✓ Confirmar Reservación';
    }
  },

  async loadMisReservas(uid) {
    console.log('📋 loadMisReservas llamado con UID:', uid);
    
    if (!window.sakuraDB) {
      console.log('Firebase no listo, reintentando...');
      setTimeout(() => this.loadMisReservas(uid), 500);
      return;
    }
    
    try {
      const { collection, query, where, getDocs, orderBy } = await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js');
      
      let q;
      if (Auth.isAdmin()) {
        console.log('👑 ADMIN: Cargando TODAS las reservaciones');
        q = query(collection(window.sakuraDB, 'reservaciones'), orderBy('fecha', 'desc'));
      } else {
        console.log('👤 USUARIO: Cargando reservaciones del UID:', uid);
        q = query(collection(window.sakuraDB, 'reservaciones'), where('uid', '==', uid), orderBy('fecha', 'desc'));
      }
      
      const querySnapshot = await getDocs(q);
      _misReservas = [];
      querySnapshot.forEach((doc) => {
        _misReservas.push({ id: doc.id, ...doc.data() });
      });
      
      console.log(`✅ Reservaciones encontradas: ${_misReservas.length}`);
      this.mostrarReservas();
      
    } catch(e) {
      console.error('Error en loadMisReservas:', e);
    }
  },

  mostrarReservas() {
    const contenedor = document.getElementById('misReservas');
    if (!contenedor) {
      console.error('No se encontró el contenedor misReservas');
      return;
    }
    
    const isAdmin = Auth.isAdmin();
    const hoy = new Date().toISOString().split('T')[0];
    
    console.log('Mostrando reservas. Cantidad:', _misReservas.length, 'esAdmin:', isAdmin);
    
    if (_misReservas.length === 0) {
      if (isAdmin) {
        contenedor.innerHTML = '<p class="empty-msg">📭 No hay reservaciones de ningún usuario.</p>';
      } else {
        contenedor.innerHTML = '<p class="empty-msg">📭 Aún no tienes reservaciones. ¡Haz tu primera reserva!</p>';
      }
      return;
    }
    
    let html = '';
    
    for (const r of _misReservas) {
      const isPast = r.fecha < hoy;
      const esPendiente = r.estado === 'pendiente';
      const esConfirmada = r.estado === 'confirmada';
      const esCancelada = r.estado === 'cancelada';
      
      let estadoTexto = '';
      let estadoColor = '';
      if (esPendiente) { estadoTexto = '⏳ PENDIENTE'; estadoColor = '#f39c12'; }
      else if (esConfirmada && !isPast) { estadoTexto = '✓ CONFIRMADA'; estadoColor = '#27ae60'; }
      else if (esConfirmada && isPast) { estadoTexto = '◉ COMPLETADA'; estadoColor = '#7f8c8d'; }
      else if (esCancelada) { estadoTexto = '✗ CANCELADA'; estadoColor = '#e74c3c'; }
      
      const areaIcono = r.area === 'fumar' ? '🚬' : '🚭';
      
      html += `
        <div style="margin-bottom:1rem; padding:1rem; background:white; border-radius:16px; border-left:4px solid ${estadoColor}; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
          ${isAdmin ? `<div style="color:#d9556b; font-size:0.75rem; margin-bottom:0.3rem;">👤 <strong>${r.nombre || '—'}</strong> | ${r.email || ''}</div>` : ''}
          <div style="display:flex; justify-content:space-between; flex-wrap:wrap;">
            <div>
              <p style="font-weight:bold; margin-bottom:0.3rem;">📅 ${r.fecha}</p>
              <p style="font-size:0.8rem; color:#7a6a5c;">🕐 ${r.horaEntrada} – ${r.horaSalida} | 👥 ${r.personas} persona(s)</p>
              ${r.notas ? `<p style="font-size:0.75rem; color:#7a6a5c; margin-top:0.3rem;">📝 ${r.notas}</p>` : ''}
            </div>
            <div style="text-align:right;">
              <span style="background:${estadoColor}; color:white; padding:0.2rem 0.6rem; border-radius:20px; font-size:0.7rem; font-weight:bold;">${estadoTexto}</span>
              <span style="margin-left:0.5rem; font-size:0.7rem;">${areaIcono} ${r.area === 'fumar' ? 'Fumar' : 'No Fumar'}</span>
            </div>
          </div>
          ${isAdmin && !esCancelada && !isPast && (esPendiente || esConfirmada) ? `
            <div style="margin-top:0.75rem; display:flex; gap:0.5rem;">
              <button onclick="Reservaciones.confirmarReserva('${r.id}')" style="background:#27ae60; color:white; border:none; padding:0.3rem 1rem; border-radius:20px; cursor:pointer;">✅ Aceptar</button>
              <button onclick="Reservaciones.cancelarReserva('${r.id}')" style="background:#e74c3c; color:white; border:none; padding:0.3rem 1rem; border-radius:20px; cursor:pointer;">❌ Cancelar</button>
            </div>
          ` : ''}
          ${!isAdmin && esPendiente && !isPast ? `
            <button onclick="Reservaciones.cancelarReserva('${r.id}')" style="margin-top:0.75rem; background:#e74c3c; color:white; border:none; padding:0.3rem 1rem; border-radius:20px; cursor:pointer;">❌ Cancelar</button>
          ` : ''}
        </div>
      `;
    }
    
    contenedor.innerHTML = html;
  },

  async confirmarReserva(id) {
    if (!Auth.isAdmin()) {
      UI.toast('No tienes permisos de administrador.', 'err');
      return;
    }
    if (!confirm('¿Confirmar esta reservación? Se enviará un ticket al cliente.')) return;
    
    try {
      const { doc, updateDoc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js');
      
      await updateDoc(doc(window.sakuraDB, 'reservaciones', id), { estado: 'confirmada' });
      
      const snap = await getDoc(doc(window.sakuraDB, 'reservaciones', id));
      const reserva = { id: snap.id, ...snap.data() };
      
      UI.toast('✅ Reservación confirmada', 'ok');
      
      if (typeof EmailService !== 'undefined') {
        UI.toast('📧 Enviando ticket al correo...', 'info');
        await EmailService.enviarTicketPorEmail(reserva);
      }
      
      const user = Auth.getUser();
      if (user) await this.loadMisReservas(user.uid);
      
    } catch(e) {
      console.error('Error al confirmar:', e);
      UI.toast('Error: ' + e.message, 'err');
    }
  },

  async cancelarReserva(id) {
    if (!confirm('¿Cancelar esta reservación?')) return;
    
    try {
      const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js');
      await updateDoc(doc(window.sakuraDB, 'reservaciones', id), { estado: 'cancelada' });
      UI.toast('❌ Reservación cancelada', 'info');
      
      const user = Auth.getUser();
      if (user) await this.loadMisReservas(user.uid);
      
    } catch(e) {
      console.error('Error al cancelar:', e);
      UI.toast('Error: ' + e.message, 'err');
    }
  },

  _formatearFecha(dateStr) {
    if (!dateStr) return 'Fecha no disponible';
    const [y, m, d] = dateStr.split('-');
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${parseInt(d)} de ${meses[parseInt(m)-1]} de ${y}`;
  }
};

window.Reservaciones = Reservaciones;
