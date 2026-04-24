let _adminTab = 'reservas';

const Admin = {
  open() { 
    if (!Auth.isAdmin()) { 
      UI.toast('Acceso denegado. Solo administradores.', 'err'); 
      return; 
    } 
    UI.showModal('modalAdmin'); 
    this.showTab(_adminTab); 
  },

  showTab(tab) {
    _adminTab = tab;
    const tabs = ['reservas', 'checklist', 'menu', 'usuarios'];
    document.querySelectorAll('.atab').forEach((btn, i) => {
      btn.classList.toggle('active', tabs[i] === tab);
    });
    const content = document.getElementById('adminContent');
    content.innerHTML = '<p class="loading-msg">⏳ Cargando...</p>';
    
    const loaders = { 
      reservas: () => this._loadReservas(), 
      checklist: () => this._loadChecklist(), 
      menu: () => this._loadMenuAdmin(), 
      usuarios: () => this._loadUsuarios() 
    };
    loaders[tab]?.();
  },

  async _loadReservas() {
    if (!FirebaseState.isReady()) { 
      document.getElementById('adminContent').innerHTML = '<p class="empty-msg">Conecta Firebase.</p>'; 
      return; 
    }
    try {
      const { collection, getDocs, orderBy, query } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
      const q = query(collection(window.sakuraDB, 'reservaciones'), orderBy('fecha', 'desc'));
      const snap = await getDocs(q);
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      this._renderReservasTable(items);
    } catch(e) { 
      document.getElementById('adminContent').innerHTML = `<p class="empty-msg">Error: ${e.message}</p>`; 
    }
  },

  _renderReservasTable(items) {
    console.log('📋 Renderizando reservas:', items.length); // Debug
    
    if (!items.length) { 
      document.getElementById('adminContent').innerHTML = '<p class="empty-msg">📭 No hay reservaciones registradas.</p>'; 
      return; 
    }
    
    const hoy = new Date().toISOString().split('T')[0];
    
    document.getElementById('adminContent').innerHTML = `
      <div style="overflow-x:auto">
        <p style="margin-bottom: 1rem; font-size: 0.85rem;">
          📊 Total: <strong>${items.length}</strong> reservaciones
        </p>
        <table class="adm-table" style="width:100%; border-collapse:collapse;">
          <thead>
            <tr style="background: var(--smoke);">
              <th style="padding: 0.75rem; text-align:left;">Cliente</th>
              <th style="padding: 0.75rem; text-align:left;">Fecha</th>
              <th style="padding: 0.75rem; text-align:left;">Hora</th>
              <th style="padding: 0.75rem; text-align:center;">Personas</th>
              <th style="padding: 0.75rem; text-align:left;">Área</th>
              <th style="padding: 0.75rem; text-align:left;">Estado</th>
              <th style="padding: 0.75rem; text-align:left;">Notas</th>
              <th style="padding: 0.75rem; text-align:center;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(r => {
              const isPast = r.fecha < hoy;
              const estadoActual = r.estado || 'pendiente'; // Si no tiene estado, asumir pendiente
              
              // Determinar qué botones mostrar
              let botonesHtml = '';
              
              // Si NO es una reserva pasada Y no está cancelada
              if (!isPast && estadoActual !== 'cancelada') {
                // Botón ACEPTAR (si está pendiente O incluso si está confirmada, por si quieres re-confirmar)
                if (estadoActual === 'pendiente' || estadoActual === 'confirmada') {
                  botonesHtml += `<button class="act-btn green" onclick="Admin.confirmarRes('${r.id}')" style="background: #27ae60; color: white; padding: 0.3rem 0.8rem; border-radius: 20px; cursor: pointer; margin-right: 0.3rem;">
                    ✅ Aceptar
                  </button>`;
                }
                
                // Botón CANCELAR (si no está cancelada)
                if (estadoActual !== 'cancelada') {
                  botonesHtml += `<button class="act-btn red" onclick="Admin.cancelarRes('${r.id}')" style="background: #e74c3c; color: white; padding: 0.3rem 0.8rem; border-radius: 20px; cursor: pointer;">
                    ❌ Cancelar
                  </button>`;
                }
              }
              
              // Si ya pasó la fecha
              if (isPast && estadoActual === 'confirmada') {
                botonesHtml = '<span style="font-size: 0.7rem; color: #7f8c8d;">✅ Completada</span>';
              }
              
              if (estadoActual === 'cancelada') {
                botonesHtml = '<span style="font-size: 0.7rem; color: #e74c3c;">❌ Cancelada</span>';
              }
              
              // Estado visual
              let estadoHtml = '';
              if (estadoActual === 'pendiente') {
                estadoHtml = '<span style="background: #f39c12; color: white; padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.7rem; font-weight: bold;">⏳ PENDIENTE</span>';
              } else if (estadoActual === 'confirmada' && !isPast) {
                estadoHtml = '<span style="background: #27ae60; color: white; padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.7rem; font-weight: bold;">✓ CONFIRMADA</span>';
              } else if (estadoActual === 'confirmada' && isPast) {
                estadoHtml = '<span style="background: #7f8c8d; color: white; padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.7rem;">◉ COMPLETADA</span>';
              } else if (estadoActual === 'cancelada') {
                estadoHtml = '<span style="background: #e74c3c; color: white; padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.7rem;">✗ CANCELADA</span>';
              }
              
              return `
                <tr style="border-bottom: 1px solid var(--border);">
                  <td style="padding: 0.75rem;">
                    <strong>${r.nombre || '—'}</strong><br>
                    <small style="color: var(--muted); font-size: 0.7rem;">${r.email || ''}</small>
                  </td>
                  <td style="padding: 0.75rem;">${r.fecha}</td>
                  <td style="padding: 0.75rem;">${r.horaEntrada} – ${r.horaSalida}</td>
                  <td style="padding: 0.75rem; text-align:center;">${r.personas}</td>
                  <td style="padding: 0.75rem;">${r.area === 'fumar' ? '🚬 Fumar' : '🚭 No Fumar'}</td>
                  <td style="padding: 0.75rem;">${estadoHtml}</td>
                  <td style="padding: 0.75rem; max-width: 10rem; white-space: normal; font-size: 0.75rem;">${r.notas || '—'}</td>
                  <td style="padding: 0.75rem; text-align:center;">
                    <div style="display: flex; gap: 0.3rem; flex-wrap: wrap; justify-content: center;">
                      ${botonesHtml}
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  // NUEVA FUNCIÓN: Confirmar/Aceptar reservación
  async confirmarRes(id) {
    if (!confirm('¿Confirmar esta reservación?')) return;
    try {
      const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
      await updateDoc(doc(window.sakuraDB, 'reservaciones', id), { 
        estado: 'confirmada',
        confirmadaPor: Auth.getUser()?.email,
        confirmadaEn: new Date().toISOString()
      });
      UI.toast('✅ Reservación confirmada exitosamente.', 'ok');
      this._loadReservas(); // Recargar la tabla
    } catch(e) { 
      UI.toast('Error al confirmar: ' + e.message, 'err'); 
    }
  },

  // Función existente para cancelar
  async cancelarRes(id) {
    if (!confirm('¿Cancelar esta reservación?')) return;
    try {
      const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
      await updateDoc(doc(window.sakuraDB, 'reservaciones', id), { 
        estado: 'cancelada',
        canceladaPor: Auth.getUser()?.email,
        canceladaEn: new Date().toISOString()
      });
      UI.toast('❌ Reservación cancelada.', 'info');
      this._loadReservas();
    } catch(e) { 
      UI.toast('Error: ' + e.message, 'err'); 
    }
  },

  async _loadMenuAdmin() {
    if (!FirebaseState.isReady()) { 
      document.getElementById('adminContent').innerHTML = '<p class="empty-msg">Conecta Firebase.</p>'; 
      return; 
    }
    try {
      const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
      const snap = await getDocs(collection(window.sakuraDB, 'menu'));
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      document.getElementById('adminContent').innerHTML = `
        <div style="overflow-x:auto">
          <table class="adm-table">
            <thead><tr><th>Platillo</th><th>Categoría</th><th>Precio</th><th>Estado</th><th>Acción</th></tr></thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td>${item.emoji} <strong>${item.name}</strong><br><small>${item.jp}</small></td>
                  <td>${item.cat}</td>
                  <td>$${item.price}</td>
                  <td><span style="color:${item.disponible ? '#27ae60' : '#7f8c8d'}">${item.disponible ? '● Disponible' : '○ No disponible'}</span></td>
                  <td><button class="act-btn ${item.disponible ? 'red' : 'green'}" onclick="Admin.toggleItem('${item.id}', ${!item.disponible})">${item.disponible ? 'Desactivar' : 'Activar'}</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch(e) { 
      document.getElementById('adminContent').innerHTML = `<p class="empty-msg">Error: ${e.message}</p>`; 
    }
  },

  async toggleItem(id, disponible) {
    try {
      const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
      await updateDoc(doc(window.sakuraDB, 'menu', id), { disponible });
      UI.toast(`Platillo ${disponible ? 'activado' : 'desactivado'}.`, 'info');
      this._loadMenuAdmin();
    } catch(e) { 
      UI.toast('Error: ' + e.message, 'err'); 
    }
  },

  async _loadChecklist() {
    document.getElementById('adminContent').innerHTML = '<p class="loading-msg">📋 Check-in/out - Próximamente</p>';
  },

  async _loadUsuarios() {
    if (!FirebaseState.isReady()) { 
      document.getElementById('adminContent').innerHTML = '<p class="empty-msg">Conecta Firebase.</p>'; 
      return; 
    }
    try {
      const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
      const snap = await getDocs(collection(window.sakuraDB, 'usuarios'));
      const users = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      document.getElementById('adminContent').innerHTML = `
        <div style="overflow-x:auto">
          <table class="adm-table">
            <thead><tr><th>Nombre</th><th>Correo</th><th>Teléfono</th><th>Rol</th><th>Acción</th></tr></thead>
            <tbody>
              ${users.map(u => `
                <tr>
                  <td><strong>${u.nombre || '—'}</strong></td>
                  <td>${u.email}</td>
                  <td>${u.telefono || '—'}</td>
                  <td><span style="background:${u.rol === 'admin' ? '#d9556b' : '#e8e0d5'}; color:${u.rol === 'admin' ? 'white' : '#7a6a5c'}; padding:.15em .6em; border-radius:20px;">${u.rol === 'admin' ? '⚙️ Admin' : '👤 User'}</span></td>
                  <td>${u.rol !== 'admin' ? `<button class="act-btn blue" onclick="Admin.makeAdmin('${u.id}')">Hacer Admin</button>` : `<button class="act-btn amber" onclick="Admin.removeAdmin('${u.id}')">Quitar Admin</button>`}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch(e) { 
      document.getElementById('adminContent').innerHTML = `<p class="empty-msg">Error: ${e.message}</p>`; 
    }
  },

  async makeAdmin(uid) {
    if (!confirm('¿Dar permisos de administrador?')) return;
    try {
      const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
      await updateDoc(doc(window.sakuraDB, 'usuarios', uid), { rol: 'admin' });
      UI.toast('✅ Administrador asignado.', 'ok');
      this._loadUsuarios();
    } catch(e) { 
      UI.toast('Error: ' + e.message, 'err'); 
    }
  },

  async removeAdmin(uid) {
    if (!confirm('¿Quitar permisos de administrador?')) return;
    try {
      const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
      await updateDoc(doc(window.sakuraDB, 'usuarios', uid), { rol: 'user' });
      UI.toast('Permisos de admin removidos.', 'info');
      this._loadUsuarios();
    } catch(e) { 
      UI.toast('Error: ' + e.message, 'err'); 
    }
  },
};