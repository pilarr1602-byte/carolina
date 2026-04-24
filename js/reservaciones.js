let _misReservas = [];
let _unsubRes = null;

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
      if (FirebaseState.isReady()) {
        await this._crearEnFirebase({ date, time, persons, area, notes });
      } else {
        this._crearLocal({ date, time, persons, area, notes });
      }
      UI.toast('¡Reservación creada! Esperando confirmación del administrador 🌸', 'ok');
      document.getElementById('reservaForm').reset();
      document.getElementById('rDate').min = new Date().toISOString().split('T')[0];
    } catch(e) { 
      UI.toast('Error: ' + e.message, 'err'); 
    } finally { 
      btn.disabled = false; 
      btn.textContent = '✓ Confirmar Reservación'; 
    }
  },

  async _crearEnFirebase({ date, time, persons, area, notes }) {
    const { collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
    const user = Auth.getUser();
    const profile = Auth.getProfile();
    const [h, m] = time.split(':').map(Number);
    const salida = `${String(h + 3).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    
    await addDoc(collection(window.sakuraDB, 'reservaciones'), {
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
  },

  _crearLocal({ date, time, persons, area, notes }) {
    const [h, m] = time.split(':').map(Number);
    const salida = `${String(h + 3).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const res = {
      id: 'local_' + Date.now(),
      uid: 'local',
      nombre: Auth.getProfile()?.nombre || 'Usuario',
      fecha: date,
      horaEntrada: time,
      horaSalida: salida,
      personas: persons,
      area: area,
      notas: notes,
      estado: 'pendiente',
      checkIn: false,
      checkOut: false,
      createdAt: new Date().toISOString(),
    };
    _misReservas.unshift(res);
    this._renderMisReservas(_misReservas);
  },

  async loadMisReservas(uid) {
    if (!FirebaseState.isReady()) return;
    try {
      const { collection, query, where, orderBy, onSnapshot } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
      
      if (_unsubRes) _unsubRes();
      
      // Obtener el email del usuario actual
      const user = Auth.getUser();
      const userEmail = user?.email || '';
      
      // DETECTAR ADMIN POR EMAIL
      const isAdmin = userEmail === 'admin@sakura.mx';
      
      let q;
      if (isAdmin) {
        console.log('👑 ADMIN: Cargando TODAS las reservaciones');
        q = query(collection(window.sakuraDB, 'reservaciones'), orderBy('fecha', 'desc'));
      } else {
        console.log('👤 USUARIO NORMAL: Cargando solo sus reservaciones');
        q = query(collection(window.sakuraDB, 'reservaciones'), where('uid', '==', uid), orderBy('fecha', 'desc'));
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
        <small style="color: var(--muted);">Estás viendo TODAS las reservaciones de todos los usuarios. Puedes aceptar o cancelar cualquier reserva.</small>
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
              <button class="act-btn green" onclick="Reservaciones.adminConfirmar('${r.id}')" style="background: #27ae60; color: white; padding: 0.3rem 1rem; border-radius: 20px; cursor: pointer; border: none;">
                ✅ Aceptar
              </button>
              <button class="act-btn red" onclick="Reservaciones.adminCancelar('${r.id}')" style="background: #e74c3c; color: white; padding: 0.3rem 1rem; border-radius: 20px; cursor: pointer; border: none;">
                ❌ Cancelar
              </button>
            </div>
          `;
        }
      } else if (!isAdmin && !isPast && isPending && !isCancelled) {
        actionButtons = `
          <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem;">
            <button class="act-btn red" onclick="Reservaciones.cancelar('${r.id}')" style="background: #e74c3c; color: white; padding: 0.3rem 1rem; border-radius: 20px; cursor: pointer; border: none;">
              ❌ Cancelar
            </button>
          </div>
        `;
      }
      
      return `
        <div class="res-item" style="margin-bottom: 1rem; padding: 1rem; background: white; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border-left: 4px solid ${isPending ? '#f39c12' : (isConfirmed ? '#27ae60' : '#e74c3c')};">
          ${clienteHtml}
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap;">
            <div>
              <p class="ri-date" style="font-weight: bold; margin-bottom: 0.3rem;">📅 ${this._formatDate(r.fecha)}</p>
              <p class="ri-meta" style="font-size: 0.8rem; color: var(--muted);">
                🕐 ${r.horaEntrada} – ${r.horaSalida} &nbsp;|&nbsp;
                👥 ${r.personas} persona${r.personas > 1 ? 's' : ''}
              </p>
              ${r.notas ? `<p class="ri-meta" style="font-size: 0.75rem; color: var(--muted); margin-top: 0.3rem;">📝 ${r.notas}</p>` : ''}
              ${r.checkIn ? '<p class="ri-meta" style="font-size: 0.7rem; color: #27ae60;">✅ Check-in registrado</p>' : ''}
            </div>
            <div style="text-align: right;">
              <span class="ri-status" style="background: ${statusBg}; color: white; padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.7rem; font-weight: bold; display: inline-block;">
                ${statusTx}
              </span>
              <span class="res-area" style="display: inline-block; margin-left: 0.5rem; font-size: 0.7rem; padding: 0.2rem 0.6rem; border-radius: 20px; background: #f0f0f0;">
                ${areaIcon} ${r.area === 'fumar' ? 'Fumar' : 'No Fumar'}
              </span>
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
      if (FirebaseState.isReady()) {
        const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
        await updateDoc(doc(window.sakuraDB, 'reservaciones', id), { estado: 'cancelada' });
        UI.toast('Reservación cancelada.', 'info');
      } else {
        const r = _misReservas.find(x => x.id === id);
        if (r) { 
          r.estado = 'cancelada'; 
          this._renderMisReservas(_misReservas); 
        }
      }
    } catch(e) { 
      UI.toast('Error al cancelar: ' + e.message, 'err'); 
    }
  },

  _formatDate(dateStr) {
    const [y, m, d] = dateStr.split('-');
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${d} ${months[+m - 1]} ${y}`;
  },

  // ═══════════════════════════════════════════════════════════════
  // FUNCIONES PARA ADMINISTRADOR (CON ENVÍO DE EMAIL)
  // ═══════════════════════════════════════════════════════════════
  
  async adminConfirmar(id) {
    if (!Auth.isAdmin()) {
      UI.toast('No tienes permisos de administrador.', 'err');
      return;
    }
    if (!confirm('¿Confirmar esta reservación? Se enviará un ticket al cliente.')) return;
    
    const btn = event?.target;
    if (btn) {
      btn.disabled = true;
      btn.textContent = '⏳ Enviando...';
    }
    
    try {
      const { doc, updateDoc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
      
      // Obtener la reserva completa
      const reservaRef = doc(window.sakuraDB, 'reservaciones', id);
      const reservaSnap = await getDoc(reservaRef);
      const reserva = { id: reservaSnap.id, ...reservaSnap.data() };
      
      // Actualizar estado en Firebase
      await updateDoc(reservaRef, { 
        estado: 'confirmada',
        confirmadaPor: Auth.getUser()?.email,
        confirmadaEn: new Date().toISOString()
      });
      
      // 📧 ENVIAR EMAIL CON TICKET PDF
      if (typeof EmailService !== 'undefined' && EmailService.enviarTicketPorEmail) {
        UI.toast('📧 Enviando ticket al correo del cliente...', 'info');
        const emailEnviado = await EmailService.enviarTicketPorEmail(reserva);
        if (emailEnviado) {
          UI.toast('✅ Ticket enviado por email', 'ok');
        } else {
          UI.toast('⚠️ No se pudo enviar el email, pero la reserva está confirmada', 'info');
        }
      } else {
        console.warn('⚠️ EmailService no está disponible');
        UI.toast('⚠️ Configuración de email pendiente', 'info');
      }
      
      UI.toast('✅ Reservación confirmada exitosamente.', 'ok');
      
    } catch(e) { 
      console.error('Error:', e);
      UI.toast('Error: ' + e.message, 'err'); 
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = '✅ Aceptar';
      }
    }
  },

  async adminCancelar(id) {
    if (!Auth.isAdmin()) {
      UI.toast('No tienes permisos de administrador.', 'err');
      return;
    }
    if (!confirm('¿Cancelar esta reservación?')) return;
    try {
      const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
      await updateDoc(doc(window.sakuraDB, 'reservaciones', id), { 
        estado: 'cancelada',
        canceladaPor: Auth.getUser()?.email,
        canceladaEn: new Date().toISOString()
      });
      UI.toast('❌ Reservación cancelada.', 'info');
    } catch(e) { 
      UI.toast('Error: ' + e.message, 'err'); 
    }
  },

  getMisReservas: () => _misReservas,
};