// ===== Camada de comunicação com o backend =====
const API = window.SAAR_API || "http://localhost:3000";

// Guarda/recupera o token JWT
const Auth = {
  get token() { return localStorage.getItem("saar_token"); },
  set token(v) { v ? localStorage.setItem("saar_token", v) : localStorage.removeItem("saar_token"); },
  get usuario() {
    try { return JSON.parse(localStorage.getItem("saar_usuario")); } catch { return null; }
  },
  set usuario(v) { localStorage.setItem("saar_usuario", JSON.stringify(v)); },
  sair() {
    localStorage.removeItem("saar_token");
    localStorage.removeItem("saar_usuario");
    localStorage.removeItem("saar_login_time");
    window.location.href = "Login.html";
  },
};

// ===== Sessão com tempo limite (2 horas por dispositivo) =====
const SESSAO_DURACAO_MS = 2 * 60 * 60 * 1000; // 2h

function iniciarSessaoTimer() {
  let inicio = Number(localStorage.getItem("saar_login_time"));
  if (!inicio) { inicio = Date.now(); localStorage.setItem("saar_login_time", String(inicio)); }

  const span = document.getElementById("sessaoTempo");
  const wrap = document.getElementById("sessaoTimer");

  function tick() {
    const restante = inicio + SESSAO_DURACAO_MS - Date.now();
    if (restante <= 0) {
      if (wrap) wrap.classList.add("alerta");
      alert("Seu acesso de 2 horas expirou. Faça login novamente.");
      Auth.sair();
      return;
    }
    if (span) {
      const h = Math.floor(restante / 3600000);
      const m = Math.floor((restante % 3600000) / 60000);
      const s = Math.floor((restante % 60000) / 1000);
      span.textContent = `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
    }
    if (wrap) wrap.classList.toggle("alerta", restante < 5 * 60 * 1000); // alerta nos últimos 5 min
  }
  tick();
  setInterval(tick, 1000);
}
window.iniciarSessaoTimer = iniciarSessaoTimer;

// Função central de requisição
async function apiFetch(caminho, opcoes = {}) {
  const headers = { "Content-Type": "application/json", ...(opcoes.headers || {}) };
  if (Auth.token) headers["Authorization"] = "Bearer " + Auth.token;

  const resp = await fetch(API + caminho, { ...opcoes, headers });

  // Sessão expirada / token inválido → volta pro login
  if (resp.status === 401 && !caminho.includes("/login")) {
    Auth.sair();
    throw new Error("Sessão expirada.");
  }

  const dados = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(dados.erro || "Erro na requisição.");
  return dados;
}

// Atalhos REST
const api = {
  get:  (c)      => apiFetch(c),
  post: (c, b)   => apiFetch(c, { method: "POST",   body: JSON.stringify(b) }),
  put:  (c, b)   => apiFetch(c, { method: "PUT",    body: JSON.stringify(b) }),
  del:  (c)      => apiFetch(c, { method: "DELETE" }),

  // Autenticação
  login: (cpf, senha) => apiFetch("/api/login", { method: "POST", body: JSON.stringify({ cpf, senha }) }),

  // Perfil próprio
  me: { ler: () => api.get("/api/me"), salvar: (b) => api.put("/api/me", b) },

  // Atalhos de domínio
  admins:    { listar: () => api.get("/api/admins"), criar: (b) => api.post("/api/admins", b), editar: (id, b) => api.put("/api/admins/" + id, b), remover: (id) => api.del("/api/admins/" + id) },
  alunos:    { listar: () => api.get("/api/alunos"), criar: (b) => api.post("/api/alunos", b), editar: (id, b) => api.put("/api/alunos/" + id, b), remover: (id) => api.del("/api/alunos/" + id) },
  chamadas:  { listar: () => api.get("/api/chamadas"), buscar: (data, turma) => api.get(`/api/chamadas/${data}/${turma}`), salvar: (b) => api.post("/api/chamadas", b), remover: (id) => api.del("/api/chamadas/" + id) },
  horarios:  { buscar: (chave) => api.get("/api/horarios/" + chave), salvar: (chave, dados) => api.put("/api/horarios/" + chave, { dados }), resetar: (chave) => api.del("/api/horarios/" + chave) },
  materiais: { listar: () => api.get("/api/materiais"), criar: (b) => api.post("/api/materiais", b), remover: (id) => api.del("/api/materiais/" + id) },
};

window.api = api;
window.Auth = Auth;

/* ===== Temas de cor x modo (claro/escuro) — compartilhado, por usuário ===== */
const NEUTROS_ESCURO = { '--bg':'#0b1220','--sidebar':'#0f1a2c','--topbar':'#0f1a2c','--card':'#111c30','--card-border':'#22314a','--sidebar-border':'#22314a','--txt':'#e8edf7','--dim':'#9aabc4','--label':'#66799a','--input-bg':'#0d1626','--input-border':'#283854' };

const TEMAS = {
  azul: {
    claro:  { '--bg':'#eef1f7','--sidebar':'#ffffff','--topbar':'#ffffff','--card':'#ffffff','--card-border':'#dde6f2','--sidebar-border':'#dde6f2','--txt':'#152232','--dim':'#4d5f78','--label':'#8a9ab0','--input-bg':'#f5f8fc','--input-border':'#cddaeb','--accent':'#14457e','--accent-hover':'#0f3a6b','--accent-light':'#e7eef7' },
    escuro: { ...NEUTROS_ESCURO, '--accent':'#5893db','--accent-hover':'#78a7e3','--accent-light':'rgba(88,147,219,.16)' },
  },
  verde: {
    claro:  { '--bg':'#eef6f1','--sidebar':'#ffffff','--topbar':'#ffffff','--card':'#ffffff','--card-border':'#d8ebe1','--sidebar-border':'#d8ebe1','--txt':'#152a1f','--dim':'#48604f','--label':'#84a091','--input-bg':'#f4faf6','--input-border':'#c7ddce','--accent':'#1f6b4a','--accent-hover':'#17543a','--accent-light':'#e2f1e8' },
    escuro: { ...NEUTROS_ESCURO, '--accent':'#3fb474','--accent-hover':'#5cc389','--accent-light':'rgba(63,180,116,.16)' },
  },
  vinho: {
    claro:  { '--bg':'#f7eeee','--sidebar':'#ffffff','--topbar':'#ffffff','--card':'#ffffff','--card-border':'#ecd7d7','--sidebar-border':'#ecd7d7','--txt':'#2c1414','--dim':'#6a4c4c','--label':'#a17e7e','--input-bg':'#fbf3f3','--input-border':'#dfc2c2','--accent':'#8f2d2d','--accent-hover':'#732222','--accent-light':'#eed6d6' },
    escuro: { ...NEUTROS_ESCURO, '--accent':'#d97878','--accent-hover':'#e2908f','--accent-light':'rgba(217,120,120,.16)' },
  },
  grafite: {
    claro:  { '--bg':'#eef0f3','--sidebar':'#ffffff','--topbar':'#ffffff','--card':'#ffffff','--card-border':'#dde2e9','--sidebar-border':'#dde2e9','--txt':'#1a222c','--dim':'#57647a','--label':'#8b96a7','--input-bg':'#f5f7fa','--input-border':'#ccd3dd','--accent':'#3a4a5e','--accent-hover':'#2c3a4a','--accent-light':'#e6eaf0' },
    escuro: { ...NEUTROS_ESCURO, '--accent':'#93a8bd','--accent-hover':'#a9bccd','--accent-light':'rgba(147,168,189,.16)' },
  },
};

function temaKeyUsuario() {
  const u = Auth.usuario;
  return u && u.id ? `saar_tema_${u.id}` : "saar_tema";
}
function temaSalvo() {
  return localStorage.getItem(temaKeyUsuario()) || localStorage.getItem("saar_tema_ultimo") || "azul";
}
function modoKeyUsuario() {
  const u = Auth.usuario;
  return u && u.id ? `saar_modo_${u.id}` : "saar_modo";
}
function modoSalvo() {
  return localStorage.getItem(modoKeyUsuario()) || localStorage.getItem("saar_modo_ultimo") || "escuro";
}
function aplicarTema(nome) {
  const modo   = modoSalvo();
  const paleta = TEMAS[nome] || TEMAS.azul;
  const t      = paleta[modo] || paleta.claro;
  const raiz   = document.documentElement;
  Object.entries(t).forEach(([k, v]) => raiz.style.setProperty(k, v));
  raiz.setAttribute("data-modo", modo);
  localStorage.setItem(temaKeyUsuario(), nome);
  localStorage.setItem("saar_tema_ultimo", nome); // usado na tela de login
  document.querySelectorAll(".tema-opt").forEach(b => b.classList.toggle("active", b.dataset.tema === nome));
  document.querySelectorAll(".modo-seg-btn").forEach(b => b.classList.toggle("active", b.dataset.modo === modo));
  document.querySelectorAll(".modo-toggle").forEach(b => b.setAttribute("aria-pressed", String(modo === "escuro")));
}
function aplicarModo(modo) {
  localStorage.setItem(modoKeyUsuario(), modo);
  localStorage.setItem("saar_modo_ultimo", modo); // usado na tela de login
  aplicarTema(temaSalvo());
}
function alternarModo() {
  aplicarModo(modoSalvo() === "escuro" ? "claro" : "escuro");
}

window.TEMAS = TEMAS;
window.aplicarTema = aplicarTema;
window.temaSalvo = temaSalvo;
window.aplicarModo = aplicarModo;
window.modoSalvo = modoSalvo;
window.alternarModo = alternarModo;
