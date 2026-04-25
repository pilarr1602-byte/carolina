import { FirebaseSetup } from './firebase-init.js';
import Auth from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🌸 Iniciando Sakura Restaurante...');
  
  if (typeof UI !== 'undefined') {
    if (UI.initNavbar) UI.initNavbar();
    if (UI.initPetals) UI.initPetals();
    if (UI.initKeyboard) UI.initKeyboard();
    if (UI.initSmoothScroll) UI.initSmoothScroll();
  }
  
  if (typeof Menu !== 'undefined' && Menu.init) await Menu.init();
  
  const fbOk = await FirebaseSetup.init();
  if (fbOk) {
    Auth.init();
    if (typeof Reservaciones !== 'undefined') Reservaciones.init();
  } else if (typeof Reservaciones !== 'undefined') {
    Reservaciones.init();
  }
  
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('lEmail')?.value.trim();
      const pass = document.getElementById('lPass')?.value;
      const isAdmin = document.getElementById('lIsAdmin')?.checked;
      await Auth.login(email, pass, isAdmin);
    });
  }
  
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('rName')?.value.trim();
      const email = document.getElementById('rEmail')?.value.trim();
      const phone = document.getElementById('rPhone')?.value.trim();
      const pass = document.getElementById('rPass')?.value;
      await Auth.register(name, email, phone, pass);
    });
  }
  
  const btnNavLogout = document.getElementById('btnNavLogout');
  if (btnNavLogout) {
    btnNavLogout.addEventListener('click', async () => {
      await Auth.logout();
    });
  }
  
  const fabAdmin = document.getElementById('fabAdmin');
  if (fabAdmin && typeof Admin !== 'undefined') {
    fabAdmin.addEventListener('click', () => { Admin.open(); });
  }
  
  console.log('%c✅ App lista!', 'color:#4d7a38;font-weight:bold');
});