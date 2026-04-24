const UI = {
  toast(msg, type = 'info', duration = 3500) {
    const box = document.getElementById('toastBox');
    if (!box) return;
    const el = document.createElement('div');
    const icon = { ok: '✅', err: '❌', info: 'ℹ️' }[type] || 'ℹ️';
    el.className = `toast ${type}`;
    el.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
    box.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 300);
    }, duration);
  },

  showModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('active');
    document.body.style.overflow = 'hidden';
    el.addEventListener('click', (e) => {
      if (e.target === el) this.hideModal(id);
    }, { once: true });
  },

  hideModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('active');
    document.body.style.overflow = '';
  },

  switchTab(tab) {
    document.querySelectorAll('.mtab').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tab);
    });
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.add('hidden'));
    document.getElementById(`pane-${tab}`)?.classList.remove('hidden');
  },

  // ========== NAVBAR CON MENÚ HAMBURGUESA ==========
  initNavbar() {
    const navbar = document.getElementById('navbar');
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('navLinks');
    
    if (!toggle || !menu) {
      console.warn('⚠️ No se encontró el botón toggle o el menú');
      return;
    }
    
    console.log('✅ Menú hamburguesa inicializado');
    
    // Abrir/cerrar al hacer clic
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.classList.toggle('open');
      toggle.classList.toggle('open');
      console.log('🍔 Menú:', menu.classList.contains('open') ? 'abierto' : 'cerrado');
    });
    
    // Cerrar al hacer clic en un enlace
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.remove('open');
        toggle.classList.remove('open');
      });
    });
    
    // Cerrar al hacer clic fuera (solo en móvil)
    document.addEventListener('click', (e) => {
      const isMobile = window.innerWidth <= 768;
      if (isMobile && menu.classList.contains('open')) {
        if (!menu.contains(e.target) && !toggle.contains(e.target)) {
          menu.classList.remove('open');
          toggle.classList.remove('open');
        }
      }
    });
    
    // Cerrar menú al redimensionar a desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && menu.classList.contains('open')) {
        menu.classList.remove('open');
        toggle.classList.remove('open');
      }
    });
    
    // Efecto de scroll
    if (navbar) {
      window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
      }, { passive: true });
    }
  },

  initPetals() {
    const container = document.getElementById('petalsContainer');
    if (!container) return;
    const emojis = ['🌸', '🌺', '🌷', '🪷'];
    const count = window.innerWidth < 480 ? 8 : 14;
    for (let i = 0; i < count; i++) {
      const petal = document.createElement('span');
      petal.className = 'petal';
      petal.textContent = emojis[i % emojis.length];
      petal.style.cssText = `left: ${Math.random() * 100}%; animation-duration: ${6 + Math.random() * 8}s; animation-delay: ${-Math.random() * 10}s; font-size: ${0.75 + Math.random() * 0.75}rem; opacity: ${0.5 + Math.random() * 0.4};`;
      container.appendChild(petal);
    }
  },

  initKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-bg.active').forEach(m => this.hideModal(m.id));
      }
    });
  },

  initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }
};