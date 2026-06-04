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

/* ===== Temas de cor (compartilhado, por usuário) ===== */
const TEMAS = {
  azul:    { '--bg':'#d8e4f3','--sidebar':'#e8f0fa','--topbar':'#e8f0fa','--card':'#eef4fb','--card-border':'#c3d4ea','--sidebar-border':'#c3d4ea','--txt':'#16202c','--dim':'#4a586b','--label':'#7c8a9c','--input-bg':'#f4f8fc','--input-border':'#bccde3','--accent':'#14457e','--accent-hover':'#0f3a6b','--accent-light':'#d6e3f4' },
  verde:   { '--bg':'#d8ece0','--sidebar':'#e6f3eb','--topbar':'#e6f3eb','--card':'#edf6f0','--card-border':'#c2dccb','--sidebar-border':'#c2dccb','--txt':'#16241c','--dim':'#47584d','--label':'#7a8a80','--input-bg':'#f3faf6','--input-border':'#bcd6c5','--accent':'#1f6b4a','--accent-hover':'#17543a','--accent-light':'#d4ebdd' },
  vinho:   { '--bg':'#efdede','--sidebar':'#f7eaea','--topbar':'#f7eaea','--card':'#faf0f0','--card-border':'#e6cccc','--sidebar-border':'#e6cccc','--txt':'#2a1818','--dim':'#5e4a4a','--label':'#967e7e','--input-bg':'#fcf5f5','--input-border':'#e0c4c4','--accent':'#8f2d2d','--accent-hover':'#732222','--accent-light':'#f0dada' },
  grafite: { '--bg':'#dfe3e9','--sidebar':'#eaedf1','--topbar':'#eaedf1','--card':'#f0f2f5','--card-border':'#d0d6de','--sidebar-border':'#d0d6de','--txt':'#1b2733','--dim':'#566173','--label':'#828c9b','--input-bg':'#f5f6f8','--input-border':'#c8cfd9','--accent':'#3a4a5e','--accent-hover':'#2c3a4a','--accent-light':'#e2e6ec' },
};

function temaKeyUsuario() {
  const u = Auth.usuario;
  return u && u.id ? `saar_tema_${u.id}` : "saar_tema";
}
function temaSalvo() {
  return localStorage.getItem(temaKeyUsuario()) || localStorage.getItem("saar_tema_ultimo") || "azul";
}
function aplicarTema(nome) {
  const t = TEMAS[nome] || TEMAS.azul;
  const raiz = document.documentElement;
  Object.entries(t).forEach(([k, v]) => raiz.style.setProperty(k, v));
  localStorage.setItem(temaKeyUsuario(), nome);
  localStorage.setItem("saar_tema_ultimo", nome); // usado na tela de login
  document.querySelectorAll(".tema-opt").forEach(b => b.classList.toggle("active", b.dataset.tema === nome));
}

window.TEMAS = TEMAS;
window.aplicarTema = aplicarTema;
window.temaSalvo = temaSalvo;
