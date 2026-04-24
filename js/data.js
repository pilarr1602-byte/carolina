const MENU_DATA = [
  // ========== COMIDAS ==========
  { id: 'm01', cat: 'comidas', name: 'Sushi', jp: '寿司', emoji: '🍣', 
    image: '/items/sushi.jpg',
    price: 285, desc: 'Arroz sazonado con vinagre, pescado fresco y mariscos.', tags: ['popular'], badge: 'b-pop' },
    
  { id: 'm02', cat: 'comidas', name: 'Ramen', jp: 'ラーメン', emoji: '🍜', 
    image: '/items/ramen.jpg',
    price: 185, desc: 'Caldo rico en umami con fideos de trigo, chashu de cerdo.', tags: ['popular'], badge: 'b-pop' },
    
  { id: 'm03', cat: 'comidas', name: 'Tempura', jp: '天ぷら', emoji: '🍤', 
    image: '/items/tempura.jpg',
    price: 195, desc: 'Camarones y verduras de temporada en rebozado crujiente.', tags: ['popular'], badge: 'b-pop' },
    
  { id: 'm04', cat: 'comidas', name: 'Takoyaki', jp: 'たこ焼き', emoji: '🐙', 
    image: '/items/takoyaki.jpg',
    price: 135, desc: 'Bolitas de masa rellenas de pulpo.', tags: ['snack'], badge: '' },
    
  { id: 'm05', cat: 'comidas', name: 'Okonomiyaki', jp: 'お好み焼き', emoji: '🥞', 
    image: '/items/okonomiyaki.jpg',
    price: 175, desc: 'Tortilla japonesa con repollo y proteína.', tags: ['personizable'], badge: '' },
    
  { id: 'm06', cat: 'comidas', name: 'Udon', jp: 'うどん', emoji: '🍝', 
    image: '/items/udon.jpg',
    price: 165, desc: 'Gruesos fideos de trigo en caldo dashi.', tags: ['vegetariano'], badge: '' },
    
  { id: 'm07', cat: 'comidas', name: 'Soba', jp: 'そば', emoji: '🍜', 
    image: '/items/soba.jpg',
    price: 158, desc: 'Fideos de trigo sarraceno, nutritivos y elegantes.', tags: ['saludable'], badge: 'b-new' },
    
  { id: 'm08', cat: 'comidas', name: 'Tonkatsu', jp: 'とんかつ', emoji: '🥩', 
    image: '/items/tonkatsu.jpg',
    price: 215, desc: 'Chuleta de cerdo empanizada y frita.', tags: ['popular'], badge: 'b-pop' },
    
  { id: 'm09', cat: 'comidas', name: 'Onigiri', jp: 'おにぎり', emoji: '🍙', 
    image: '/items/onigiri.jpg',
    price: 75, desc: 'Bolitas de arroz rellenas de atún o salmón.', tags: ['snack'], badge: '' },
    
  { id: 'm10', cat: 'comidas', name: 'Bento', jp: '弁当', emoji: '🍱', 
    image: '/items/bento.jpg',
    price: 245, desc: 'Caja de comida equilibrada con arroz y proteína.', tags: ['completo'], badge: 'b-new' },

  // ========== POSTRES ==========
  { id: 'p01', cat: 'postres', name: 'Mochi', jp: '餅', emoji: '🍡', 
    image: '/items/mochi.jpg',
    price: 85, desc: 'Pastelito de arroz glutinoso relleno de anko.', tags: ['dulce'], badge: '' },
    
  { id: 'p02', cat: 'postres', name: 'Dorayaki', jp: 'どら焼き', emoji: '🥞', 
    image: '/items/dorayaki.jpg',
    price: 78, desc: 'Tortitas rellenas de pasta de frijol azuki.', tags: ['clásico'], badge: '' },
    
  { id: 'p03', cat: 'postres', name: 'Dango', jp: '団子', emoji: '🍡', 
    image: '/items/dango.jpg',
    price: 72, desc: 'Brochetas de mochi glaseadas.', tags: ['popular'], badge: 'b-pop' },
    
  { id: 'p04', cat: 'postres', name: 'Taiyaki', jp: 'たい焼き', emoji: '🐟', 
    image: '/items/taiyaki.jpg',
    price: 88, desc: 'Pan con forma de pez relleno de matcha.', tags: ['caliente'], badge: '' },
    
  { id: 'p05', cat: 'postres', name: 'Matcha Ice Cream', jp: '抹茶アイス', emoji: '🍦', 
    image: '/items/matcha-ice.jpg',
    price: 95, desc: 'Helado artesanal de té verde matcha.', tags: ['popular'], badge: 'b-pop' },

  // ========== BEBIDAS ==========
  { id: 'b01', cat: 'bebidas', name: 'Sake', jp: '酒', emoji: '🍶', 
    image: '/items/sake.jpg',
    price: 145, desc: 'Sake junmai daiginjo importado.', tags: ['alcohólico'], badge: 'b-pop' },
    
  { id: 'b02', cat: 'bebidas', name: 'Matcha', jp: '抹茶', emoji: '🍵', 
    image: '/items/matcha-tea.jpg',
    price: 95, desc: 'Té verde en polvo ceremonial.', tags: ['sin azúcar'], badge: 'b-pop' },
    
  { id: 'b03', cat: 'bebidas', name: 'Genmaicha', jp: '玄米茶', emoji: '🍵', 
    image: '/items/genmaicha.jpg',
    price: 78, desc: 'Té verde con arroz integral tostado.', tags: ['herbal'], badge: '' },
    
  { id: 'b04', cat: 'bebidas', name: 'Ramune', jp: 'ラムネ', emoji: '🫧', 
    image: '/items/ramune.jpg',
    price: 65, desc: 'Refresco japonés con bolilla.', tags: ['refrescante'], badge: '' },

  // ========== SNACKS ==========
  { id: 's01', cat: 'snacks', name: 'Yakitori', jp: '焼き鳥', emoji: '🍢', 
    image: '/items/yakitori.jpg',
    price: 145, desc: 'Brochetas de pollo a las brasas.', tags: ['popular'], badge: 'b-pop' },
    
  { id: 's02', cat: 'snacks', name: 'Karaage', jp: '唐揚げ', emoji: '🍗', 
    image: '/items/karaage.jpg',
    price: 158, desc: 'Pollo marinado frito crujiente.', tags: ['popular'], badge: 'b-pop' },
    
  { id: 's03', cat: 'snacks', name: 'Gyoza', jp: '餃子', emoji: '🥟', 
    image: '/items/gyoza.jpg',
    price: 125, desc: 'Dumplings de cerdo y col.', tags: ['popular'], badge: 'b-pop' },
    
  { id: 's04', cat: 'snacks', name: 'Edamame', jp: '枝豆', emoji: '🫛', 
    image: '/items/edamame.jpg',
    price: 68, desc: 'Vainas de soya al vapor con sal.', tags: ['vegano'], badge: '' },

  // ========== TRADICIONALES ==========
  { id: 't01', cat: 'tradicionales', name: 'Japanese Curry', jp: 'カレーライス', emoji: '🍛', 
    image: '/items/curry.jpg',
    price: 195, desc: 'Curry japonés con pollo o res.', tags: ['popular'], badge: 'b-pop' },
    
  { id: 't02', cat: 'tradicionales', name: 'Oyakodon', jp: '親子丼', emoji: '🍚', 
    image: '/items/oyakodon.jpg',
    price: 175, desc: 'Tazón de arroz con pollo y huevo.', tags: ['casero'], badge: '' },
    
  { id: 't03', cat: 'tradicionales', name: 'Miso Soup', jp: '味噌汁', emoji: '🍜', 
    image: '/items/miso.jpg',
    price: 55, desc: 'Sopa de pasta de soya con tofu.', tags: ['vegetariano'], badge: '' }
];

window.MENU_DATA = MENU_DATA;