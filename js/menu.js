let _allItems = [];
let _activeCat = 'all';

const Menu = {
  async init() {
    console.log('📋 Inicializando Menú...');
    this._bindCats();
    if (window.MENU_DATA && window.MENU_DATA.length) {
      _allItems = [...window.MENU_DATA];
      this.render(_activeCat);
      console.log(`✅ Menú cargado: ${_allItems.length} platillos`);
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
    
    grid.innerHTML = filtered.map((item, idx) => `
      <article class="menu-card" style="--ci:${idx * 0.04}s" onclick="Menu.showDetail('${item.id}')">
        <div class="mc-emoji">
          ${item.image 
            ? `<img src="${item.image}" alt="${item.name}" style="width:100%; height:100%; object-fit:cover; border-radius:16px 16px 0 0;">` 
            : `<span style="font-size: 3rem;">${item.emoji || '🍽️'}</span>`
          }
        </div>
        <div class="mc-body">
          <p class="mc-cat">${this._catLabel(item.cat)}</p>
          <h3 class="mc-name">${item.name}</h3>
          <p class="mc-jp">${item.jp || ''}</p>
          <p class="mc-desc">${item.desc}</p>
          <div class="mc-foot">
            <span class="mc-price">$${item.price}</span>
            ${item.badge ? `<span class="mc-badge ${item.badge}">${this._badgeLabel(item.badge)}</span>` : ''}
          </div>
        </div>
      </article>
    `).join('');
    console.log(`✅ Renderizados ${filtered.length} platillos`);
  },

  showDetail(id) {
    const item = _allItems.find(i => i.id === id);
    if (!item) return;
    document.getElementById('itemDetail').innerHTML = `
      <div class="item-det-emoji">${item.image ? `<img src="${item.image}" style="width:100%; max-width:300px; border-radius:16px;">` : `<span style="font-size:4rem;">${item.emoji}</span>`}</div>
      <h2 class="item-det-name">${item.name}</h2>
      <p class="item-det-jp">${item.jp || ''}</p>
      <p class="item-det-desc">${item.desc}</p>
      <div class="item-det-meta"><span class="item-det-price">$${item.price}</span></div>
      <div style="margin-top:1.5rem"><a href="#reservaciones" onclick="UI.hideModal('modalItem')" class="btn-primary btn-full">📅 Reservar</a></div>
    `;
    if (typeof UI !== 'undefined') UI.showModal('modalItem');
  },

  _bindCats() {
    document.querySelectorAll('.cat-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
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
  }
};

window.Menu = Menu;