const WA_PHONE = "56XXXXXXXXX";
const ADDRESS = "Antonio Varas 666, Providencia";
const MAP_LAT = "-33.4330583";
const MAP_LNG = "-70.6154230440881";
const MAP_ZOOM = "15";
const OPEN_HOUR = 12;
const CLOSE_HOUR = 23;

const SERVICE_MENUS = {
  degustacion: [
    {
      id: "deg-chile",
      name: "Degustación Chilena",
      items: ["Pebre y pan amasado", "Ostiones parmesanos", "Pastel de choclo mini", "Cordero al palo", "Kuchen sureño"]
    },
    {
      id: "deg-peru",
      name: "Degustación Peruana",
      items: ["Ceviche clásico", "Tiradito de ají amarillo", "Causa limeña", "Lomo saltado", "Suspiro a la limeña"]
    }
  ],
  romantica: [
    { id:"rom-peru", name:"Romance del Pacífico (Perú)", items:["Ostras al ají limo","Ceviche de conchas","Risotto de mariscos","Mousse de maracuyá con cacao"] },
    { id:"rom-chile", name:"Sabores del Sur (Chile)", items:["Ostiones parmesanos","Salmón al merkén","Papas nativas","Frutillas en vino navegado"] },
    { id:"rom-fusion", name:"Andes & Costa (Fusión)", items:["Tiradito de reineta","Pulpo al olivo","Filete al carmenere","Suspiro con berries del sur"] }
  ]
};

const $ = (selector, el = document) => el.querySelector(selector);
const $$ = (selector, el = document) => [...el.querySelectorAll(selector)];
const encode = (s) => encodeURIComponent(s);
const waHref = (msg) => `https://wa.me/${WA_PHONE}?text=${encode(msg)}`;

function setupScrollSpy() {
  const links = $$(".nav-link");
  links.forEach(a => a.removeAttribute("aria-current"));
  const sections = links.map(a => $(a.getAttribute("href"))).filter(Boolean);
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = `#${entry.target.id}`;
      const link = links.find(a => a.getAttribute("href") === id);
      if (!link) return;
      if (entry.isIntersecting) {
        links.forEach(a => a.removeAttribute("aria-current"));
        link.setAttribute("aria-current", "page");
      }
    });
  }, { rootMargin: "-50% 0px -50% 0px" });
  sections.forEach(sec => obs.observe(sec));
}

function setupWhatsAppCTAs() {
  const addr = $("#addr");
  if (addr) addr.textContent = ADDRESS;
  const map = $("#map");
  if (map) map.src = `https://maps.google.com/maps?q=${MAP_LAT},${MAP_LNG}&z=${MAP_ZOOM}&output=embed`;
  const mapLink = $("#map-link");
  if (mapLink) mapLink.href = `https://www.google.com/maps/dir/?api=1&destination=${MAP_LAT},${MAP_LNG}`;
  const tel = $("#tel");
  if (tel) tel.href = `tel:+${WA_PHONE}`;
  $$(".js-wa-cta").forEach(a => {
    const msg = a.dataset.waMsg || "Hola, quiero reservar.";
    a.href = waHref(msg);
    a.target = "_blank";
    a.rel = "noopener";
  });
}

const MENU_DATA = {
  "Entradas": [
    { name: "Ceviche Clásico Peruano", desc: "Cubos de pescado fresco macerados en leche de tigre con ají limo, cebolla morada, camote glaseado y cancha.", price: "$11990" },
    { name: "Empanadas Chilenas (Pino y Queso)", desc: "Horno: pino (carne, cebolla, huevo, aceitunas) y opción queso.", price: "$4990" },
    { name: "Tiradito de Pescado", desc: "Láminas de pescado blanco en salsa de ají amarillo, limón y cilantro.", price: "$11990" }
  ],
  "Platos de Fondo": [
    { name: "Lomo Saltado", desc: "Lomo, cebolla, tomate y ají salteados. Con papas rústicas y arroz.", price: "$12990" },
    { name: "Pastel de Choclo", desc: "Guiso de vacuno y pollo con pasta de choclo gratinada.", price: "$8990" },
    { name: "Ají de Gallina", desc: "Pechuga desmenuzada en salsa cremosa de ají amarillo y queso.", price: "$13990" },
    { name: "Cazuela de Vacuno", desc: "Sopa tradicional con verduras de estación.", price: "$7990" },
    { name: "Pescado a lo Macho", desc: "Filete frito/plancha con salsa de mariscos y ají.", price: "$15890" }
  ],
  "Postres": [
    { name: "Suspiro a la Limeña (Perú)", desc: "Manjar con merengue de oporto y canela.", price: "$4890" },
    { name: "Mote con Huesillo (Chile)", desc: "Clásico jugo acaramelado con mote y huesillos.", price: "$3000" },
    { name: "Tres Leches (Perú)", desc: "Bizcocho bañado en tres leches con crema.", price: "$4890" }
  ],
  "Tragos y Bebidas": [
    { name: "Pisco Sour Peruano", desc: "", price: "$7990" },
    { name: "Terremoto Chileno", desc: "", price: "$8990" },
    { name: "Chicha Morada (sin alcohol)", desc: "", price: "$4000" },
    { name: "Selección de Vinos Chilenos", desc: "", price: "$4500" }
  ]
};

function renderMenu() {
  const root = $("#menu-root");
  if (!root) return;
  root.innerHTML = "";
  Object.entries(MENU_DATA).forEach(([cat, items]) => {
    const block = document.createElement("section");
    block.className = "menu-block";
    block.setAttribute("aria-labelledby", `cat-${cat}`);
    block.dataset.reveal = "";
    const h3 = document.createElement("h3");
    h3.id = `cat-${cat}`;
    h3.textContent = cat;
    const ul = document.createElement("ul");
    ul.className = "menu-list";
    items.forEach(({ name, desc, price }) => {
      const li = document.createElement("li");
      li.className = "menu-item";
      li.innerHTML = `
        <div class="name">${name}</div>
        <div class="price">${price || "$—"}</div>
        ${desc ? `<div class="desc">${desc}</div>` : ""}
      `;
      ul.appendChild(li);
    });
    block.append(h3, ul);
    root.appendChild(block);
  });
}

function setupReveal() {
  const elements = $$("[data-reveal]");
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  elements.forEach(el => io.observe(el));
}

(function carousel() {
  document.addEventListener('DOMContentLoaded', () => {
    $$(".carousel").forEach(setupCarousel);
  });
  function setupCarousel(root) {
    const viewport = $(".viewport", root);
    const track = $(".track", root);
    const slides = $$(".track>*", root);
    const prev = $(".prev", root);
    const next = $(".next", root);
    const autoplayMs = parseInt(root.dataset.autoplay || "6000", 10);
    const itemsMobile = parseInt(root.dataset.itemsMobile || "1", 10);
    const itemsDesktop = parseInt(root.dataset.itemsDesktop || "4", 10);
    const breakpoint = 1024;
    const mq = window.matchMedia(`(min-width:${breakpoint}px)`);
    let index = 0, show = 1, slideW = 0, gap = 0, timer = null;
    const getGap = () => parseFloat(getComputedStyle(track).gap || "0") || 0;
    const maxIndex = () => Math.max(0, slides.length - show);
    const calcShow = () => (mq.matches ? itemsDesktop : itemsMobile);
    function setSizes() {
      show = calcShow();
      gap = getGap();
      const vw = viewport.clientWidth;
      slideW = (vw - gap * (show - 1)) / show;
      slides.forEach(s => {
        s.style.width = `${slideW}px`;
        s.style.flex = `0 0 ${slideW}px`;
      });
      goTo(index, false);
    }
    function goTo(i, animate = true) {
      const maxI = maxIndex();
      if (i < 0) i = maxI;
      if (i > maxI) i = 0;
      index = i;
      track.style.transition = animate ? 'transform .4s ease' : 'none';
      const x = -(index * (slideW + gap));
      track.style.transform = `translateX(${x}px)`;
    }
    function start() { if (autoplayMs > 0) timer = setInterval(() => goTo(index + 1), autoplayMs); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function restart() { stop(); start(); }
    prev?.addEventListener('click', () => { goTo(index - 1); restart(); });
    next?.addEventListener('click', () => { goTo(index + 1); restart(); });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') next?.click();
      if (e.key === 'ArrowLeft') prev?.click();
    });
    let startX = 0, touching = false;
    viewport.addEventListener('touchstart', (e) => {
      if (!e.touches[0]) return;
      touching = true;
      startX = e.touches[0].clientX;
      stop();
    }, { passive: true });
    viewport.addEventListener('touchend', (e) => {
      if (!touching) return;
      touching = false;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) (dx < 0 ? next : prev)?.click();
      start();
    }, { passive: true });
    window.addEventListener('resize', setSizes);
    mq.addEventListener?.('change', setSizes);
    setSizes();
    start();
    viewport.setAttribute('tabindex', viewport.getAttribute('tabindex') ?? '0');
  }
})();

function validateEmailDetailed(emailRaw) {
  const errors = [];
  const email = (emailRaw || "").trim();
  if (!email) {
    errors.push("El correo no puede estar vacío.");
    return { ok: false, errors };
  }
  if (!email.includes("@")) {
    errors.push("Falta el ‘@’ en el correo.");
    return { ok: false, errors };
  }
  const parts = email.split("@");
  if (parts.length !== 2) {
    errors.push("El correo debe tener un solo ‘@’.");
    return { ok: false, errors };
  }
  const [local, domain] = parts;
  if (!local) errors.push("Falta texto antes de ‘@’.");
  if (!domain) errors.push("Falta el dominio después de ‘@’. (ej. ejemplo.cl, ejemplo.com)");
  if (domain) {
    if (!domain.includes(".")) {
      errors.push("Al dominio le falta un punto (ej. .cl, .com).");
    } else {
      const labels = domain.split(".");
      const tld = labels.pop();
      if (!/^[A-Za-z]{2,10}$/.test(tld)) {
        errors.push("La terminación del dominio debe tener 2–10 letras (ej. cl, com, org).");
      }
      const labelOk = labels.every(l => /^[A-Za-z0-9-]{1,63}$/.test(l));
      if (!labelOk) errors.push("El dominio contiene caracteres no válidos.");
    }
  }
  return { ok: errors.length === 0, errors };
}

function validateChileanRUT(rutRaw) {
  const raw = (rutRaw || "").trim().toUpperCase().replace(/\./g, "");
  if (!raw) return { ok: false, error: "El RUT no puede estar vacío." };
  const parts = raw.split("-");
  if (parts.length !== 2) return { ok: false, error: "Formato de RUT inválido. Usa 12345678-5" };
  const body = parts[0];
  const dv = parts[1];
  if (!/^\d{7,8}$/.test(body)) return { ok: false, error: "El cuerpo del RUT debe tener 7 u 8 dígitos." };
  if (!/^[0-9K]$/.test(dv)) return { ok: false, error: "El dígito verificador debe ser 0–9 o K." };
  let sum = 0, mul = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * mul;
    mul = (mul === 7) ? 2 : mul + 1;
  }
  const rest = 11 - (sum % 11);
  const dvCal = (rest === 11) ? "0" : (rest === 10) ? "K" : String(rest);
  if (dvCal !== dv) return { ok: false, error: "RUT inválido: el dígito verificador no coincide." };
  return { ok: true };
}

function isValidDateTodayOrLater(iso) {
  if (!iso) return false;
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d)) return false;
  const today = new Date(); today.setHours(0,0,0,0);
  return d >= today;
}

function isValidReservationTime(hhmm) {
  if (!/^\d{2}:\d{2}$/.test(hhmm)) return false;
  const [h, m] = hhmm.split(":").map(Number);
  if (h < OPEN_HOUR || h > CLOSE_HOUR) return false;
  if (m < 0 || m > 59) return false;
  return true;
}

function toggleReservaFields() {
  const sel = $("#tipo-solicitud");
  const box = $("#reserva-fields");
  const note = $("#reserva-note");
  const submitBtn = $("#button-submit");
  if (!sel || !box) return;
  const active = sel.value === "reserva";
  if (active) {
    box.classList.remove("is-hidden");
    box.removeAttribute("aria-hidden");
    box.removeAttribute("disabled");
    note?.classList.remove("is-hidden");
    const fecha = $("#r-fecha");
    if (fecha) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      fecha.min = `${yyyy}-${mm}-${dd}`;
    }
    const hora = $("#r-hora");
    if (hora) {
      hora.min = `${String(OPEN_HOUR).padStart(2,"0")}:00`;
      hora.max = `${String(CLOSE_HOUR).padStart(2,"0")}:59`;
      hora.step = 900;
    }
    const pers = $("#r-personas");
    if (pers) {
      pers.min = "1";
      pers.max = "12";
    }
    if (submitBtn) {
      submitBtn.textContent = "Haz tu reserva";
      submitBtn.setAttribute("aria-label", "Haz tu reserva");
    }
  } else {
    box.classList.add("is-hidden");
    box.setAttribute("aria-hidden", "true");
    box.setAttribute("disabled", "");
    note?.classList.add("is-hidden");
    if (submitBtn) {
      submitBtn.textContent = "Enviar Mensaje";
      submitBtn.setAttribute("aria-label", "Enviar Mensaje");
    }
  }
}

function validateForm(e) {
  e.preventDefault();
  const form = $(".contacto-form");
  const tipo = ($("#tipo-solicitud")?.value || "").trim();
  const nombre = ($("#nombre")?.value || "").trim();
  const correo = ($("#correo")?.value || "").trim();
  const telefono = ($("#telefono")?.value || "");
  const mensaje = ($("#mensaje")?.value || "").trim();
  const errors = [];
  if (!tipo) {
    errors.push("Selecciona el tipo de solicitud (Consulta, Reclamo, Felicitaciones o Reserva).");
  }
  const NAME_RE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'-]{2,60}$/;
  if (!NAME_RE.test(nombre)) {
    errors.push("El nombre sólo puede contener letras (incluye acentos), espacios, guion o apóstrofe (mín. 2 caracteres).");
  }
  const emailCheck = validateEmailDetailed(correo);
  if (!emailCheck.ok) errors.push(...emailCheck.errors);
  const phoneOnlyDigits = telefono.replace(/\D+/g, "");
  if (!/^\d{9}$/.test(phoneOnlyDigits)) {
    errors.push("Por favor, introduce un número de teléfono válido (9 dígitos).");
  }
  if (tipo === "reserva") {
    const rRUT = ($("#r-rut")?.value || "").trim();
    const rFecha = ($("#r-fecha")?.value || "").trim();
    const rHora = ($("#r-hora")?.value || "").trim();
    const rPers = parseInt(($("#r-personas")?.value || "0"), 10);
    const rutOK = validateChileanRUT(rRUT);
    if (!rutOK.ok) errors.push(rutOK.error);
    if (!isValidDateTodayOrLater(rFecha)) {
      errors.push("La fecha debe ser hoy o posterior.");
    }
    if (!isValidReservationTime(rHora)) {
      errors.push(`La hora debe estar entre ${String(OPEN_HOUR).padStart(2,"0")}:00 y ${String(CLOSE_HOUR).padStart(2,"0")}:59.`);
    }
    if (!(Number.isInteger(rPers) && rPers >= 1 && rPers <= 12)) {
      errors.push("La cantidad de personas debe ser un número entre 1 y 12.");
    }
  } else {
    if (mensaje.length < 10) {
      errors.push("El mensaje debe tener al menos 10 caracteres.");
    }
  }
  if (errors.length > 0) {
    showPopup("¡Hubo un error!", errors.join("<br>"), "error");
    return;
  }
  const resumen = [];
  resumen.push(`Tipo: ${tipo}`);
  resumen.push(`Nombre: ${nombre}`);
  resumen.push(`Correo: ${correo}`);
  resumen.push(`Teléfono: ${phoneOnlyDigits}`);
  if (tipo === "reserva") {
    resumen.push(
      `RUT: ${($("#r-rut")?.value || "").trim()}`,
      `Fecha: ${($("#r-fecha")?.value || "").trim()}`,
      `Hora: ${($("#r-hora")?.value || "").trim()}`,
      `Personas: ${($("#r-personas")?.value || "").trim()}`
    );
  } else {
    resumen.push(`Mensaje: ${mensaje}`);
  }
  showPopup("¡Mensaje enviado!", resumen.join("\n"), "success");
  form?.reset();
  toggleReservaFields();
}

const isPopupOpen = () => !!document.getElementById("popup-overlay");

function showPopup(title, message, type, opts = {}) {
  const existing = document.getElementById("popup-overlay");
  if (existing) existing.remove();
  const modal = document.getElementById("modal");
  if (modal) modal.dataset.lock = "1";
  const html = `
    <div class="popup-overlay" id="popup-overlay" role="dialog" aria-modal="true" aria-labelledby="popup-title">
      <div class="popup-content ${type}">
        <h2 id="popup-title">${title}</h2>
        <p>${message}</p>
        <button class="popup-close" type="button" aria-label="Cerrar">OK</button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", html);
  const overlay = document.getElementById("popup-overlay");
  const btnClose = overlay.querySelector(".popup-close");
  setTimeout(() => btnClose.focus(), 0);
  const close = (e) => {
    e?.stopPropagation?.();
    overlay.remove();
    if (modal) delete modal.dataset.lock;
    if (opts.focusEl && typeof opts.focusEl.focus === "function") {
      opts.focusEl.focus();
    }
    if (typeof opts.onClose === "function") opts.onClose();
  };
  btnClose.addEventListener("click", close);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(e); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(e); }, { once: true });
}

function createModalIfNeeded() {
  if (document.getElementById("modal-overlay")) return;
  const overlay = document.createElement("div");
  overlay.id = "modal-overlay";
  overlay.className = "modal-overlay is-hidden";
  overlay.setAttribute("aria-hidden", "true");
  const modal = document.createElement("div");
  modal.id = "modal";
  modal.className = "modal is-hidden";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-labelledby", "modal-title");
  modal.innerHTML = `
    <div class="modal__header">
      <h3 id="modal-title">Reserva</h3>
      <button id="modal-close" aria-label="Cerrar">×</button>
    </div>
    <div id="modal-body" class="modal__body">
      <p class="helper">Cargando formulario… (se añadirá en el siguiente paso)</p>
    </div>
    <div class="modal__footer">
      <button id="modal-cancel" class="btn btn-ghost" type="button">Cancelar</button>
      <button id="modal-confirm" class="btn btn-primary" type="button">Reservar</button>
    </div>
  `;
  document.body.append(overlay, modal);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay && !isPopupOpen()) hideModal();
  });
  modal.addEventListener("click", (e) => {
    const isCloseBtn = e.target.id === "modal-close";
    const isCancel = e.target.id === "modal-cancel";
    if ((isCloseBtn || isCancel) && !isPopupOpen()) {
      hideModal();
    }
  });
  modal.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    const focusables = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      last.focus(); e.preventDefault();
    } else if (!e.shiftKey && document.activeElement === last) {
      first.focus(); e.preventDefault();
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !isPopupOpen()) hideModal();
  });
}

let _prevFocus = null;
function showModal() {
  const overlay = document.getElementById("modal-overlay");
  const modal = document.getElementById("modal");
  if (!overlay || !modal) return;
  _prevFocus = document.activeElement;
  overlay.classList.remove("is-hidden");
  modal.classList.remove("is-hidden");
  overlay.removeAttribute("aria-hidden");
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
  document.getElementById("modal-close")?.focus();
}

function hideModal() {
  const overlay = document.getElementById("modal-overlay");
  const modal = document.getElementById("modal");
  if (!overlay || !modal) return;
  overlay.classList.add("is-hidden");
  modal.classList.add("is-hidden");
  overlay.setAttribute("aria-hidden", "true");
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
  _prevFocus?.focus();
}

const SERVICE_TITLES = {
  degustacion: "Reserva — Menú Degustación",
  romantica: "Reserva — Cenas Románticas",
  ejecutivo: "Reserva — Menú Ejecutivo"
};

window.AppValidators = window.AppValidators || {};

if (!AppValidators.validateEmailDetailed) {
  AppValidators.validateEmailDetailed = function(emailRaw){
    const errors = [];
    const email = (emailRaw || "").trim();
    if (!email) { errors.push("El correo no puede estar vacío."); return { ok:false, errors }; }
    if (!email.includes("@")) { errors.push("Falta el ‘@’ en el correo."); return { ok:false, errors }; }
    const parts = email.split("@");
    if (parts.length !== 2) { errors.push("El correo debe tener un solo ‘@’."); return { ok:false, errors }; }
    const [local, domain] = parts;
    if (!local) errors.push("Falta texto antes de ‘@’.");
    if (!domain) errors.push("Falta el dominio después de ‘@’. (ej. ejemplo.cl, ejemplo.com)");
    if (domain){
      if (!domain.includes(".")) errors.push("Al dominio le falta un punto (ej. .cl, .com).");
      else {
        const labels = domain.split(".");
        const tld = labels.pop();
        if (!/^[A-Za-z]{2,10}$/.test(tld)) errors.push("La terminación del dominio debe tener 2–10 letras (ej. cl, com, org).");
        const labelOk = labels.every(l => /^[A-Za-z0-9-]{1,63}$/.test(l));
        if (!labelOk) errors.push("El dominio contiene caracteres no válidos.");
      }
    }
    return { ok: errors.length === 0, errors };
  };
}

if (!AppValidators.validateChileanRUT) {
  AppValidators.validateChileanRUT = function(rutRaw){
    const raw = (rutRaw || "").trim().toUpperCase().replace(/\./g, "").replace(/\s+/g, "");
    if (!raw) return { ok:false, error:"El RUT no puede estar vacío." };
    const parts = raw.split("-");
    if (parts.length !== 2) return { ok:false, error:"Formato de RUT inválido. Usa 12.345.678-5" };
    const body = parts[0], dv = parts[1];
    if (!/^\d{7,8}$/.test(body)) return { ok:false, error:"El cuerpo del RUT debe tener 7 u 8 dígitos." };
    if (!/^[0-9K]$/.test(dv)) return { ok:false, error:"El dígito verificador debe ser 0–9 o K." };
    let sum=0, mul=2;
    for (let i = body.length - 1; i >= 0; i--) {
      sum += parseInt(body[i], 10) * mul;
      mul = (mul === 7) ? 2 : mul + 1;
    }
    const rest = 11 - (sum % 11);
    const dvCal = (rest === 11) ? "0" : (rest === 10) ? "K" : String(rest);
    if (dvCal !== dv) return { ok:false, error:"RUT inválido: el dígito verificador no coincide." };
    return { ok:true };
  };
}

const NAME_RE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'-]{2,60}$/;
const phoneIs9 = (raw) => /^\d{9}$/.test((raw||"").replace(/\D+/g,""));

function renderServiceModalForm(type) {
  const body = document.getElementById("modal-body");
  body.innerHTML = "";
  if (type === "degustacion" || type === "romantica") {
    const group = document.createElement("div");
    group.className = "field";
    group.innerHTML = `<label class="label">Elige tu menú</label>`;
    const choices = document.createElement("div");
    choices.className = "choices";
    (SERVICE_MENUS[type] || []).forEach(menu => {
      const item = document.createElement("label");
      item.className = "choice";
      item.innerHTML = `
        <input type="radio" name="modal-menu" value="${menu.id}">
        <div>
          <strong>${menu.name}</strong>
          <div class="helper">${menu.items.join(" · ")}</div>
        </div>
      `;
      choices.appendChild(item);
    });
    group.appendChild(choices);
    body.appendChild(group);
  } else if (type === "ejecutivo") {
    const note = document.createElement("p");
    note.className = "helper";
    note.textContent = "*Ajustado al menú del día*";
    body.appendChild(note);
  }
  const fieldPeople = document.createElement("div");
  fieldPeople.className = "field";
  fieldPeople.innerHTML = `
    <label class="label" for="m-personas">Cantidad de personas</label>
    <input class="input-form" id="m-personas" type="number" min="1" max="12" placeholder="Ej: 2">
  `;
  body.appendChild(fieldPeople);
  const fieldResp = document.createElement("div");
  fieldResp.className = "field";
  fieldResp.innerHTML = `
    <label class="label">Responsable de la reserva</label>
    <div class="grid-2">
      <div class="field"><input class="input-form" id="m-nombre" type="text" placeholder="Nombre"></div>
      <div class="field"><input class="input-form" id="m-apellidos" type="text" placeholder="Apellidos"></div>
    </div>
    <div class="grid-2">
      <div class="field"><input class="input-form" id="m-telefono" type="tel" inputmode="numeric" placeholder="Teléfono (9 dígitos)"></div>
      <div class="field"><input class="input-form" id="m-correo" type="email" placeholder="Correo"></div>
    </div>
    ${type !== "ejecutivo" ? `<div class="field"><input class="input-form" id="m-rut" type="text" placeholder="RUT (Chile) 12.345.678-5"></div>` : ``}
  `;
  body.appendChild(fieldResp);
  const guestsWrap = document.createElement("div");
  guestsWrap.className = "guests";
  guestsWrap.id = "m-guests";
  body.appendChild(guestsWrap);
  document.getElementById("m-personas").addEventListener("input", buildGuestsFields);
  enforceNumericInput(document.getElementById("m-telefono"));
  enforceNumericInput(document.getElementById("m-personas"), { min: 1, max: 12 });
}

function buildGuestsFields() {
  const wrap = document.getElementById("m-guests");
  const n = parseInt(document.getElementById("m-personas")?.value || "0", 10);
  if (!wrap) return;
  wrap.innerHTML = "";
  if (Number.isInteger(n) && n > 1) {
    for (let i = 2; i <= n; i++) {
      const item = document.createElement("div");
      item.className = "guest-item";
      item.innerHTML = `
        <label class="label" for="m-guest-${i}">Nombre completo (persona ${i})</label>
        <input class="input-form" id="m-guest-${i}" type="text" placeholder="Nombre y apellidos">
      `;
      wrap.appendChild(item);
    }
  }
}

function handleModalConfirm(type) {
  const errors = [];
  let firstInvalidEl = null;
  let menuId = null;
  if (type === "degustacion" || type === "romantica") {
    const checked = document.querySelector('input[name="modal-menu"]:checked');
    if (!checked) {
      errors.push("Selecciona un menú.");
      if (!firstInvalidEl) firstInvalidEl = document.querySelector('input[name="modal-menu"]');
    } else {
      menuId = checked.value;
    }
  }
  const personasEl = document.getElementById("m-personas");
  const vPers = parseInt(personasEl?.value || "0", 10);
  if (!(Number.isInteger(vPers) && vPers >= 1 && vPers <= 12)) {
    errors.push("La cantidad de personas debe ser entre 1 y 12.");
    if (!firstInvalidEl) firstInvalidEl = personasEl;
  }
  const nombreEl = document.getElementById("m-nombre");
  const apeEl = document.getElementById("m-apellidos");
  const telEl = document.getElementById("m-telefono");
  const mailEl = document.getElementById("m-correo");
  const rutEl = document.getElementById("m-rut");
  const rNombre = nombreEl?.value?.trim() || "";
  const rApe = apeEl?.value?.trim() || "";
  const rTel = telEl?.value || "";
  const rMail = mailEl?.value?.trim() || "";
  const rRut = rutEl?.value?.trim() || "";
  if (!NAME_RE.test(rNombre)) {
    errors.push("Nombre (responsable) inválido.");
    if (!firstInvalidEl) firstInvalidEl = nombreEl;
  }
  if (!NAME_RE.test(rApe)) {
    errors.push("Apellidos (responsable) inválidos.");
    if (!firstInvalidEl) firstInvalidEl = apeEl;
  }
  if (!phoneIs9(rTel)) {
    errors.push("Teléfono (responsable) inválido: 9 dígitos.");
    if (!firstInvalidEl) firstInvalidEl = telEl;
  }
  const emailChk = AppValidators.validateEmailDetailed(rMail);
  if (!emailChk.ok) {
    errors.push(...emailChk.errors);
    if (!firstInvalidEl) firstInvalidEl = mailEl;
  }
  if (type !== "ejecutivo") {
    const rutOk = AppValidators.validateChileanRUT(rRut);
    if (!rutOk.ok) {
      errors.push(rutOk.error);
      if (!firstInvalidEl) firstInvalidEl = rutEl;
    }
  }
  const guests = [];
  if (vPers > 1) {
    for (let i = 2; i <= vPers; i++) {
      const gEl = document.getElementById(`m-guest-${i}`);
      const g = gEl?.value?.trim() || "";
      if (!g) {
        errors.push(`Falta el nombre completo de la persona ${i}.`);
        if (!firstInvalidEl) firstInvalidEl = gEl;
      }
      guests.push(g);
    }
  }
  if (errors.length) {
    showPopup("Revisa los datos", errors.join("<br>"), "error", {
      focusEl: firstInvalidEl
    });
    return;
  }
  const lines = [];
  lines.push(`Servicio: ${type === "degustacion" ? "Menú Degustación" : type === "romantica" ? "Cenas Románticas" : "Menú Ejecutivo"}`);
  if (menuId) {
    const all = [...(SERVICE_MENUS.degustacion||[]), ...(SERVICE_MENUS.romantica||[])];
    const picked = all.find(m => m.id === menuId);
    if (picked) lines.push(`Menú elegido: ${picked.name}`);
  }
  lines.push(`Personas: ${vPers}`);
  lines.push(`Responsable: ${rNombre} ${rApe}`);
  lines.push(`Teléfono: ${rTel.replace(/\D+/g,"")}`);
  lines.push(`Correo: ${rMail}`);
  if (type !== "ejecutivo") lines.push(`RUT: ${rRut}`);
  if (guests.length) {
    lines.push("Acompañantes:");
    guests.forEach((g,i) => lines.push(`  ${i+1}. ${g}`));
  }
  if (type === "ejecutivo") lines.push("*Ajustado al menú del día*");
  showPopup("¡Reserva realizada con éxito!", lines.join("\n"), "success");
  hideModal();
}

function openServiceModal(type) {
  createModalIfNeeded();
  const title = document.getElementById("modal-title");
  const overlay = document.getElementById("modal-overlay");
  const btnX = document.getElementById("modal-close");
  const btnCan = document.getElementById("modal-cancel");
  const btnOk = document.getElementById("modal-confirm");
  title.textContent = SERVICE_TITLES[type] || "Reserva";
  renderServiceModalForm(type);
  showModal();
  overlay.onclick = (e) => { if (e.target === overlay && !isPopupOpen()) hideModal(); };
  btnX.onclick = () => { if (!isPopupOpen()) hideModal(); };
  btnCan.onclick = () => { if (!isPopupOpen()) hideModal(); };
  btnOk.onclick = () => handleModalConfirm(type);
}

function openAdminLoginModal() {
  createModalIfNeeded();

  const title   = document.getElementById("modal-title");
  const overlay = document.getElementById("modal-overlay");
  const btnX    = document.getElementById("modal-close");
  const btnCan  = document.getElementById("modal-cancel");
  const btnOk   = document.getElementById("modal-confirm");
  const body    = document.getElementById("modal-body");

  title.textContent = "Acceso administrador";
  body.innerHTML = `
    <div class="field" style="text-align:center;padding:24px 0">
      <p class="lead" style="margin:12px 0 0">sevienen cositas.....</p>
    </div>
  `;

  btnOk.textContent = "OK";
  btnCan.textContent = "Cerrar";

  overlay.onclick = (e) => { if (e.target === overlay && !isPopupOpen()) hideModal(); };
  btnX.onclick    = () => { if (!isPopupOpen()) hideModal(); };
  btnCan.onclick  = () => { if (!isPopupOpen()) hideModal(); };
  btnOk.onclick   = () => { if (!isPopupOpen()) hideModal(); };

  showModal();
}


document.addEventListener("DOMContentLoaded", () => {
  const y = $("#year");
  if (y) y.textContent = new Date().getFullYear();
  setupWhatsAppCTAs();
  setupScrollSpy();
  renderMenu();
  setupReveal();
  const contactForm = $(".contacto-form");
  if (contactForm) contactForm.addEventListener("submit", validateForm);
  const tipoSel = $("#tipo-solicitud");
  if (tipoSel) {
    tipoSel.addEventListener("change", toggleReservaFields);
    toggleReservaFields();
    enforceNumericInput(document.getElementById("telefono"));
    enforceNumericInput(document.getElementById("r-personas"), { min: 1, max: 12 });
  }
  $$(".js-service").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const tipo = btn.dataset.service;
      openServiceModal(tipo);
    });
  });
  const adminBtn = document.getElementById("btn-admin");
if (adminBtn) {
  adminBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    openAdminLoginModal();
  });
}

});

function enforceNumericInput(input, { min = null, max = null } = {}) {
  if (!input) return;
  const filter = () => {
    let v = input.value.replace(/\D+/g, "");
    if (v !== "" && (min !== null || max !== null)) {
      let n = parseInt(v, 10);
      if (!isNaN(n)) {
        if (min !== null && n < min) n = min;
        if (max !== null && n > max) n = max;
        v = String(n);
      }
    }
    input.value = v;
  };
  input.addEventListener("input", filter);
  input.addEventListener("keydown", (e) => {
    const ok = ["Backspace","Delete","Tab","ArrowLeft","ArrowRight","Home","End"].includes(e.key) || /^\d$/.test(e.key);
    if (!ok) e.preventDefault();
  });
}

