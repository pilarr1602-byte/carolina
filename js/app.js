document.addEventListener('DOMContentLoaded', async () => {
  console.log('🌸 Iniciando Sakura Restaurante...');
  
  // Inicializar UI
  if (UI) {
    UI.initNavbar();
    UI.initPetals();
    UI.initKeyboard();
    UI.initSmoothScroll();
  }
  
  // Inicializar menú
  if (Menu && Menu.init) {
    await Menu.init();
    console.log('✅ Menú inicializado');
  }
  
  // Firebase
  let fbOk = false;
  if (FirebaseSetup && FirebaseSetup.init) {
    fbOk = await FirebaseSetup.init();
  }
  
  if (fbOk && Auth) {
    Auth.init();
    if (Reservaciones) Reservaciones.init();
  } else if (Reservaciones) {
    Reservaciones.init();
  }
  
  // Login
  const loginForm = document.getElementById('loginForm');
  if (loginForm && Auth) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('lEmail')?.value;
      const pass = document.getElementById('lPass')?.value;
      if (fbOk) await Auth.login(email, pass, false);
    });
  }
  
  // Botones
  const btnLogin = document.getElementById('btnNavLogin');
  if (btnLogin) {
    btnLogin.addEventListener('click', () => UI.showModal('modalAuth'));
  }
  
  const fabAdmin = document.getElementById('fabAdmin');
  if (fabAdmin && Admin) {
    fabAdmin.addEventListener('click', () => Admin.open());
  }
  
  console.log('✅ App lista!');
});