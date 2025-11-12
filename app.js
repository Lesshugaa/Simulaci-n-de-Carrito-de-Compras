/* ===============================
   Simulador de Carrito – Actividad 15
   Requisitos implementados (PDF): login/registro, catálogo, carrito, checkout.
   Almacenamiento: localStorage.
   =============================== */

// ---------- Utilidades ----------
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const money = (n) =>
  n.toLocaleString("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2 });

// ---------- Datos simulados ----------
const PRODUCTS = [
  { id: "p1", name: "Auriculares Inalámbricos Pro", price: 48999, stock: 15, tag: "Nuevo",
    img: "https://source.unsplash.com/800x600/?headphones,tech" },
  { id: "p2", name: "Teclado Mecánico RGB", price: 75999, stock: 9, tag: "Hot",
    img: "https://source.unsplash.com/800x600/?keyboard,mechanical" },
  { id: "p3", name: "Mouse Gamer 8K DPI", price: 39999, stock: 20, tag: "Oferta",
    img: "https://source.unsplash.com/800x600/?mouse,gaming" },
  { id: "p4", name: "Monitor 27” 144Hz", price: 299999, stock: 5, tag: "Premium",
    img: "https://source.unsplash.com/800x600/?monitor" },
  { id: "p5", name: "Silla Ergonómica", price: 219999, stock: 7, tag: "Comfort",
    img: "https://source.unsplash.com/800x600/?chair,office" },
  { id: "p6", name: "Micrófono USB Studio", price: 129999, stock: 10, tag: "Creator",
    img: "https://source.unsplash.com/800x600/?microphone,studio" }
];

// ---------- Estado ----------
const store = {
  user: JSON.parse(localStorage.getItem("user") || "null"),
  cart: JSON.parse(localStorage.getItem("cart") || "[]"),
  coupon: null // { code, percent }
};

const COUPONS = {
  DIS_10: 10,
  DIS_15: 15,
  DIS_25: 25
};

// ---------- Render Auth ----------
function renderAuth() {
  const logged = !!store.user;
  $("#btnLogin").hidden = logged;
  $("#btnRegister").hidden = logged;
  $("#btnLogout").hidden = !logged;
  $("#welcome").textContent = logged ? `Hola, ${store.user.name}` : "";
  $("#authPanel").hidden = logged;  // si ya está logueado, oculto panel
  $("#catalogPanel").hidden = !logged;
}
function logout() {
  store.user = null;
  localStorage.removeItem("user");
  renderAuth();
}

// ---------- Tabs Auth ----------
function setupAuthTabs() {
  $$(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      $$(".tab").forEach(t => t.classList.remove("active"));
      $$(".form").forEach(f => f.classList.remove("active"));
      tab.classList.add("active");
      const id = tab.dataset.tab;
      document.getElementById(id).classList.add("active");
    });
  });
}

// ---------- Registro / Login ----------
function setupAuthForms() {
  $("#registerForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#regName").value.trim();
    const email = $("#regEmail").value.trim().toLowerCase();
    const pass = $("#regPassword").value;

    if (!name || !email || pass.length < 6) return alert("Completá todos los campos (mín. 6 caracteres).");

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    if (users.find(u => u.email === email)) return alert("Ese email ya está registrado.");
    users.push({ name, email, pass });
    localStorage.setItem("users", JSON.stringify(users));

    store.user = { name, email };
    localStorage.setItem("user", JSON.stringify(store.user));
    renderAuth();
    alert("Cuenta creada ✔️");
  });

  $("#loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = $("#loginEmail").value.trim().toLowerCase();
    const pass = $("#loginPassword").value;
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const found = users.find(u => u.email === email && u.pass === pass);
    if (!found) return alert("Credenciales inválidas.");
    store.user = { name: found.name, email: found.email };
    localStorage.setItem("user", JSON.stringify(store.user));
    renderAuth();
  });

  $("#btnLogout").addEventListener("click", () => {
    logout();
    alert("Sesión cerrada.");
    location.hash = ""; // “cierra” el carrito si estaba abierto
  });
}

// ---------- Catálogo ----------
function renderCatalog(list = PRODUCTS) {
  const grid = $("#productGrid");
  grid.innerHTML = "";
  list.forEach(p => {
    const card = document.createElement("article");
    card.className = "product";
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}" loading="lazy">
      <div class="badge">${p.tag}</div>
      <h3>${p.name}</h3>
      <div class="price">${money(p.price)}</div>
      <div class="qty-row">
        <input type="number" min="1" max="${p.stock}" value="1" id="qty-${p.id}">
        <button class="btn btn-accent" data-id="${p.id}">Agregar</button>
      </div>
      <small class="muted">Stock: ${p.stock} · ID: ${p.id}</small>
    `;
    grid.appendChild(card);
  });

  grid.querySelectorAll("button[data-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const qty = parseInt(document.getElementById(`qty-${id}`).value || "1", 10);
      addToCart(id, qty);
    });
  });
}

function setupCatalogFilters() {
  $("#q").addEventListener("input", filterAndOrder);
  $("#orderBy").addEventListener("change", filterAndOrder);
}

function filterAndOrder() {
  const q = $("#q").value.toLowerCase().trim();
  const order = $("#orderBy").value;
  let list = PRODUCTS.filter(p => p.name.toLowerCase().includes(q));

  const sorters = {
    "name-asc": (a,b)=> a.name.localeCompare(b.name),
    "price-asc": (a,b)=> a.price - b.price,
    "price-desc":(a,b)=> b.price - a.price
  };
  list = list.sort(sorters[order]);
  renderCatalog(list);
}

// ---------- Carrito ----------
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(store.cart));
}
function updateCartCount() {
  const count = store.cart.reduce((acc,i)=>acc + i.qty, 0);
  $("#cartCount").textContent = count;
}
function addToCart(id, qty=1) {
  const prod = PRODUCTS.find(p => p.id === id);
  if (!prod) return;
  const item = store.cart.find(i => i.id === id);
  const newQty = (item?.qty || 0) + qty;
  if (newQty > prod.stock) return alert("No hay stock suficiente.");
  if (item) item.qty = newQty;
  else store.cart.push({ id, qty });
  saveCart(); updateCartCount();
  openCart();
}

function removeFromCart(id) {
  store.cart = store.cart.filter(i => i.id !== id);
  saveCart(); updateCartCount(); renderCart();
}

function changeQty(id, qty) {
  const prod = PRODUCTS.find(p => p.id === id);
  const item = store.cart.find(i => i.id === id);
  if (!item || !prod) return;
  const q = Math.max(1, Math.min(prod.stock, parseInt(qty || "1", 10)));
  item.qty = q;
  saveCart(); updateCartCount(); renderCart();
}

function totals() {
  const lines = store.cart.map(i => {
    const p = PRODUCTS.find(x => x.id === i.id);
    return { ...i, price: p.price, name: p.name, subtotal: p.price * i.qty };
  });
  const sub = lines.reduce((a,l) => a + l.subtotal, 0);
  const percent = store.coupon?.percent || 0;
  const disc = sub * (percent/100);
  const total = sub - disc;
  return { lines, sub, disc, total };
}

function renderCart() {
  const has = store.cart.length > 0;
  $("#cartEmpty").hidden = has;
  $("#cartTableWrapper").hidden = !has;
  $("#ticket").hidden = true;

  if (!has) { $("#coupon").value = ""; $("#couponMsg").textContent=""; store.coupon = null; updateMoney(0,0,0); return; }

  const tbody = $("#cartBody");
  tbody.innerHTML = "";

  const { lines, sub, disc, total } = totals();
  lines.forEach(line => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${line.name}</td>
      <td>${money(line.price)}</td>
      <td>
        <input type="number" min="1" max="99" value="${line.qty}" data-id="${line.id}" class="qtyInput"/>
      </td>
      <td>${money(line.subtotal)}</td>
      <td><button class="btn btn-danger" data-remove="${line.id}">Quitar</button></td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll(".qtyInput").forEach(inp=>{
    inp.addEventListener("change", () => changeQty(inp.dataset.id, inp.value));
  });
  tbody.querySelectorAll("button[data-remove]").forEach(btn=>{
    btn.addEventListener("click", ()=> removeFromCart(btn.dataset.remove));
  });

  updateMoney(sub, disc, total);
}

function updateMoney(sub, disc, total) {
  $("#subTotal").textContent = money(sub);
  $("#discount").textContent = `- ${money(disc)}`;
  $("#grandTotal").textContent = money(total);
}

function applyCoupon() {
  const code = $("#coupon").value.trim().toUpperCase();
  if (!code) { $("#couponMsg").textContent = "Ingresá un cupón."; return; }
  if (!COUPONS[code]) { $("#couponMsg").textContent = "Cupón inválido."; store.coupon = null; renderCart(); return; }
  store.coupon = { code, percent: COUPONS[code] };
  $("#couponMsg").textContent = `Cupón aplicado: ${store.coupon.percent}%`;
  renderCart();
}

function checkout() {
  if (!store.user) return alert("Debés iniciar sesión.");
  const { lines, sub, disc, total } = totals();
  if (lines.length === 0) return;

  // “Genera” ticket
  const now = new Date();
  const ticket = [
    "===== TICKET PWD – Carrito =====",
    `Cliente: ${store.user.name} <${store.user.email}>`,
    `Fecha: ${now.toLocaleString("es-AR")}`,
    "",
    ...lines.map(l => `• ${l.name} x${l.qty}  ${money(l.price)}  = ${money(l.subtotal)}`),
    "",
    `Subtotal:  ${money(sub)}`,
    `Descuento: ${money(disc)} ${store.coupon ? `(${store.coupon.code})` : ""}`,
    `TOTAL:     ${money(total)}`,
    "==============================="
  ].join("\n");

  $("#ticket").textContent = ticket;
  $("#ticket").hidden = false;

  // Vaciar carrito
  store.cart = [];
  store.coupon = null;
  saveCart(); updateCartCount(); renderCart();
}

// ---------- Navegación simple ----------
function openCart() {
  $("#cartPanel").hidden = false;
  renderCart();
  location.hash = "#cart";
}

function setupNav() {
  $("#btnCart").addEventListener("click", openCart);
  $("#applyCoupon").addEventListener("click", applyCoupon);
  $("#checkout").addEventListener("click", checkout);
  $("#btnLogin").addEventListener("click", ()=> {
    $("#authPanel").hidden = false;
    window.scrollTo({top:0, behavior:"smooth"});
  });
  $("#btnRegister").addEventListener("click", ()=> {
    $("#authPanel").hidden = false;
    $$('.tab')[1].click();
    window.scrollTo({top:0, behavior:"smooth"});
  });

  window.addEventListener("hashchange", () => {
    if (location.hash === "#cart") openCart();
  });
}

// ---------- Init ----------
function init() {
  setupAuthTabs();
  setupAuthForms();
  setupCatalogFilters();
  setupNav();
  renderAuth();
  renderCatalog(PRODUCTS);
  renderCart();
  updateCartCount();
}
document.addEventListener("DOMContentLoaded", init);
