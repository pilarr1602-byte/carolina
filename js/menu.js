let _allItems = [];
let _activeCat = 'all';

const Menu = {
  async init() {
    console.log('📋 Inicializando Menú...');
    this._bindCats();
    this._loadFromLocal();
    
    if (FirebaseState && FirebaseState.isReady()) {
      try {
        await this._loadFromFirebase();
      } catch(e) {
        console.log('Firebase no disponible');
      }
    }
  },

  async _loadFromFirebase() {
    try {
      const { collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
      const snap = await getDocs(collection(window.sakuraDB, 'menu'));
      if (!snap.empty) {
        _allItems = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        this.render(_activeCat);
      }
    } catch(e) { console.log(e); }
  },

  _loadFromLocal() {
    if (typeof MENU_DATA !== 'undefined' && MENU_DATA.length) {
      _allItems = [...MENU_DATA];
      this.render(_activeCat);
      console.log(`✅ Menú cargado: ${_allItems.length} platillos`);
    } else {
      console.error('❌ MENU_DATA no está definido');
    }
  },

  render(cat = 'all') {
    _activeCat = cat;
    const grid = document.getElementById('menuGrid');
    const spinner = document.getElementById('menuSpinner');
    if (!grid) return;
    if (spinner) spinner.classList.add('hidden');
    
    const filtered = cat === 'all' ? _allItems : _allItems.filter(i => i.cat === cat);
    
    if (!filtered.length) {
      grid.innerHTML = '<p class="empty-msg">🍽️ No hay platillos en esta categoría.</p>';
      return;
    }
    
    // RENDER CON IMÁGENES
    grid.innerHTML = filtered.map((item, idx) => {
      // Usar imagen si existe, sino usar emoji
      const imagenUrl = item.image || null;
      return `
        <article class="menu-card" style="--ci:${idx * 0.04}s" onclick="Menu.showDetail('${item.id}')">
          <div class="mc-emoji">
            ${imagenUrl 
              ? `<img src="${imagenUrl}" alt="${item.name}" loading="lazy" onerror="this.style.display='none'; this.parentElement.innerHTML='<span style=\'font-size:3rem;\'>${item.emoji || '🍽️'}</span>'">` 
              : `<span style="font-size: 3rem;">${item.emoji || '🍽️'}</span>`
            }
          </div>
          <div class="mc-body">
            <p class="mc-cat">${this._catLabel(item.cat)}</p>
            <h3 class="mc-name">${item.name || 'Sin nombre'}</h3>
            <p class="mc-jp">${item.jp || ''}</p>
            <p class="mc-desc">${item.desc || 'Delicioso platillo japonés'}</p>
            <div class="mc-foot">
              <span class="mc-price">$${item.price || 0}</span>
              ${item.badge ? `<span class="mc-badge ${item.badge}">${this._badgeLabel(item.badge)}</span>` : ''}
            </div>
          </div>
        </article>
      `;
    }).join('');
    
    console.log(`✅ Renderizados ${filtered.length} platillos`);
  },

  showDetail(id) {
    const item = _allItems.find(i => i.id === id);
    if (!item) return;
    
    const imagenUrl = item.image || null;
    const detailDiv = document.getElementById('itemDetail');
    if (!detailDiv) return;
    
    detailDiv.innerHTML = `
      <div class="item-det-emoji">
        ${imagenUrl 
          ? `<img src="${imagenUrl}" alt="${item.name}" style="width:100%; max-width:300px; border-radius:16px;">` 
          : `<span style="font-size: 4rem;">${item.emoji || '🍽️'}</span>`
        }
      </div>
      <h2 class="item-det-name">${item.name}</h2>
      <p class="item-det-jp">${item.jp || ''}</p>
      <p class="item-det-desc">${item.desc || 'Platillo tradicional japonés.'}</p>
      <div class="item-det-meta">
        <span class="item-det-price">$${item.price}</span>
      </div>
      <div style="margin-top:1.5rem">
        <a href="#reservaciones" onclick="UI.hideModal('modalItem')" class="btn-primary btn-full">📅 Reservar</a>
      </div>
    `;
    UI.showModal('modalItem');
  },

  _bindCats() {
    const catPills = document.querySelectorAll('.cat-pill');
    if (!catPills.length) return;
    catPills.forEach(btn => {
      btn.addEventListener('click', () => {
        catPills.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.render(btn.dataset.cat);
      });
    });
  },

  _catLabel(cat) {
    const map = { comidas: '🍱 Comidas', postres: '🍡 Postres', bebidas: '🍶 Bebidas', snacks: '🍢 Snacks', tradicionales: '🍛 Tradicionales' };
    return map[cat] || cat;
  },
  
  _badgeLabel(badge) {
    const map = { 'b-pop': '⭐ Popular', 'b-new': '✨ Nuevo', 'b-hot': '🔥 Especial' };
    return map[badge] || badge;
  },

  getAll: () => _allItems,
};