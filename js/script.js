/* ========= CONFIG (reemplaza con tus datos) ========= */
const WA_PHONE = "56XXXXXXXXX"; // <-- tu número con código país sin + ni espacios
const ADDRESS  = "Calle ___ #___, Ciudad";
const MAP_LAT  = -33.4489;      // Santiago (ejemplo). Reemplaza.
const MAP_LNG  = -70.6693;

/* ========= UTIL: construir link de WhatsApp ========= */
function buildWaLink(message = "Hola, quiero reservar para ___ personas el ___ a las ___"){
  const q = encodeURIComponent(message);
  return `https://wa.me/${WA_PHONE}?text=${q}`;
}

/* ========= NAV: hamburguesa, smooth scroll y scrollspy ========= */
const nav      = document.querySelector('.nav');
const hamb     = document.querySelector('.hamb');
const menu     = document.getElementById('menu');
const navLinks = [...document.querySelectorAll('.nav-link')];

if (hamb && menu){
  hamb.addEventListener('click', ()=>{
    const open = menu.classList.toggle('open');
    hamb.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

// Smooth scroll con offset del header
function smoothScrollTo(id){
  const el = document.querySelector(id);
  if (!el) return;
  const headerH = nav.getBoundingClientRect().height;
  const y = el.getBoundingClientRect().top + window.pageYOffset - (headerH - 1);
  window.scrollTo({top: y, behavior: 'smooth'});
}

navLinks.forEach(a=>{
  a.addEventListener('click', (e)=>{
    const href = a.getAttribute('href');
    if (href.startsWith('#')){
      e.preventDefault();
      smoothScrollTo(href);
      menu.classList.remove('open'); // cerrar menú móvil
      hamb.setAttribute('aria-expanded','false');
    }
  });
});

// Scrollspy con IntersectionObserver
const sections = [
  '#inicio','#quienes-somos','#menu-carta','#servicios','#contacto'
].map(id => document.querySelector(id)).filter(Boolean);

const io = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if (entry.isIntersecting){
      const id = `#${entry.target.id}`;
      navLinks.forEach(link=>{
        if (link.getAttribute('href') === id){
          link.setAttribute('aria-current','page');
        }else{
          link.removeAttribute('aria-current');
        }
      });
    }
  });
},{
  root: null,
  threshold: 0.6
});
sections.forEach(sec=> io.observe(sec));

/* ========= CTA WhatsApp (hero, servicios, FAB) ========= */
function wireWhatsAppCTAs(){
  document.querySelectorAll('.js-wa-cta').forEach(a=>{
    a.setAttribute('href', buildWaLink());
  });
  const tel = document.getElementById('tel-link');
  if (tel) tel.href = `tel:+${WA_PHONE}`;
  const addr = document.getElementById('address-text');
  if (addr) addr.textContent = ADDRESS;
}
wireWhatsAppCTAs();

/* ========= Año dinámico en footer ========= */
document.getElementById('year').textContent = new Date().getFullYear();

/* ========= Mapa (simple embebido con lat/lng) ========= */
(function setMap(){
  const iframe = document.getElementById('map-embed');
  if(!iframe) return;
  const src = `https://maps.google.com/maps?q=${MAP_LAT},${MAP_LNG}&z=16&output=embed`;
  iframe.setAttribute('src', src);
})();

/* ========= Reveal on scroll (a11y friendly) ========= */
const revealIo = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if (e.isIntersecting){
      e.target.classList.add('is-visible');
      revealIo.unobserve(e.target);
    }
  });
},{threshold: 0.2});
document.querySelectorAll('.reveal').forEach(el=> revealIo.observe(el));

/* ========= Carrusel accesible (testimonios) ========= */
(function initCarousel(){
  const car = document.querySelector('#testimonios .carousel');
  if(!car) return;
  const track   = car.querySelector('.track');
  const slides  = [...car.querySelectorAll('.slide')];
  const prevBtn = car.querySelector('.prev');
  const nextBtn = car.querySelector('.next');
  const vp      = car.querySelector('.viewport');
  const autoplayMs   = parseInt(car.dataset.autoplay || '0',10);
  const itemsMobile  = parseInt(car.dataset.itemsMobile || '1',10);
  const itemsDesktop = parseInt(car.dataset.itemsDesktop || '3',10);
  let itemsPerView   = window.innerWidth >= 1024 ? itemsDesktop : itemsMobile;
  let idx = 0, timer = null;

  function layout(){
    itemsPerView = window.innerWidth >= 1024 ? itemsDesktop : itemsMobile;
    const basis = (100 / itemsPerView) + '%';
    slides.forEach(s => s.style.flex = `0 0 ${basis}`);
    clamp(); render();
  }
  function clamp(){
    const max = Math.max(0, slides.length - itemsPerView);
    if (idx > max) idx = 0;
    if (idx < 0) idx = max;
  }
  function render(){
    const slideW = 100 / itemsPerView;
    track.style.transform = `translateX(${-(idx*slideW)}%)`;
  }
  function next(){ idx++; clamp(); render(); }
  function prev(){ idx--; clamp(); render(); }

  if (nextBtn) nextBtn.addEventListener('click', next);
  if (prevBtn) prevBtn.addEventListener('click', prev);

  // teclado
  if (vp){
    vp.addEventListener('keydown', (e)=>{
      if (e.key === 'ArrowRight'){ e.preventDefault(); next(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    });
  }

  // swipe táctil
  let startX = 0;
  vp.addEventListener('pointerdown', e=>{ startX = e.clientX; vp.setPointerCapture(e.pointerId); });
  vp.addEventListener('pointerup', e=>{
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 30) { dx < 0 ? next() : prev(); }
  });

  // autoplay (pausa en hover/visibilidad)
  function start(){ if (autoplayMs >= 1000) timer = setInterval(next, autoplayMs); }
  function stop(){ if (timer) clearInterval(timer); timer = null; }
  car.addEventListener('mouseenter', stop);
  car.addEventListener('mouseleave', start);
  document.addEventListener('visibilitychange', ()=> document.hidden ? stop() : start());

  window.addEventListener('resize', layout, {passive:true});
  layout(); start();
})();

/* ========= Carta (render desde JSON) ========= */
const MENU_DATA = [
  {
    category: "Entradas",
    items: [
      { name: "Ceviche Clásico Peruano", desc: "Cubos de pescado fresco en leche de tigre con ají limo, cebolla morada, camote glaseado y cancha.", price: "—" },
      { name: "Empanadas Chilenas (Pino y Queso)", desc: "Clásicas de horno: pino (carne, cebolla, huevo y aceitunas) o queso.", price: "—" },
      { name: "Tiradito de Pescado", desc: "Finas láminas de pescado en suave salsa de ají amarillo, limón y cilantro.", price: "—" }
    ]
  },
  {
    category: "Platos de Fondo",
    items: [
      { name: "Lomo Saltado", desc: "Trozos de lomo salteados con cebolla, tomate y ají. Con papas rústicas y arroz.", price: "—" },
      { name: "Pastel de Choclo", desc: "Guiso de vacuno y pollo cubierto con pasta de choclo dulce, gratinado al horno.", price: "—" },
      { name: "Ají de Gallina", desc: "Pechuga desmenuzada en crema de ají amarillo y queso. Con papas y aceitunas.", price: "—" },
      { name: "Cazuela de Vacuno", desc: "Sopa tradicional con carne, papas, zapallo, choclo y porotos verdes.", price: "—" },
      { name: "Pescado a lo Macho", desc: "Filete frito o a la plancha con salsa cremosa de mariscos y ají.", price: "—" }
    ]
  },
  {
    category: "Postres",
    items: [
      { name: "Suspiro a la Limeña (Perú)", desc: "Manjar con merengue de oporto y canela.", price: "—" },
      { name: "Mote con Huesillo (Chile)", desc: "Huesillos con mote en jugo acaramelado.", price: "—" },
      { name: "Tres Leches (Perú)", desc: "Bizcocho esponjoso bañado en tres leches y crema.", price: "—" }
    ]
  },
  {
    category: "Tragos y Bebidas",
    items: [
      { name: "Pisco Sour Peruano", desc: "Pisco, limón, jarabe de goma, clara y amargo de angostura.", price: "—" },
      { name: "Terremoto Chileno", desc: "Vino pipeño, helado de piña y fernet.", price: "—" },
      { name: "Chicha Morada (sin alcohol)", desc: "Maíz morado con piña, canela y clavo.", price: "—" },
      { name: "Selección de Vinos Chilenos", desc: "Valles centrales: cabernet, carmenere, sauvignon blanc.", price: "—" }
    ]
  }
];

(function renderMenu(){
  const root = document.getElementById('menu-list');
  if (!root) return;

  MENU_DATA.forEach(group=>{
    const cat = document.createElement('section');
    cat.className = 'menu-category';

    const head = document.createElement('div');
    head.className = 'cat-head';
    const h3 = document.createElement('h3'); h3.textContent = group.category;
    head.appendChild(h3);

    const items = document.createElement('div');
    items.className = 'menu-items';

    group.items.forEach(item=>{
      const row = document.createElement('div');
      row.className = 'menu-item';

      const left = document.createElement('div');
      const name = document.createElement('div');
      name.className = 'name'; name.textContent = item.name;
      const desc = document.createElement('div');
      desc.className = 'desc'; desc.textContent = item.desc;
      left.appendChild(name); left.appendChild(desc);

      const price = document.createElement('div');
      price.className = 'price'; price.textContent = item.price || "—";

      row.appendChild(left);
      row.appendChild(price);
      items.appendChild(row);
    });

    cat.appendChild(head);
    cat.appendChild(items);
    root.appendChild(cat);
  });
})();

/* ========= Formulario (demo sin backend) ========= */
(function wireForm(){
  const form = document.getElementById('contact-form');
  if(!form) return;
  const msg = document.getElementById('form-msg');
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    if (!form.checkValidity()){
      msg.textContent = "Revisa los campos requeridos.";
      msg.style.color = "#b91c1c";
      return;
    }
    msg.textContent = "¡Gracias! Te responderemos pronto.";
    msg.style.color = "#16a34a";
    form.reset();
    setTimeout(()=> msg.textContent = "", 4000);
  });
})();
