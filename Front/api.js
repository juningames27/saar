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
  azul:    { '--bg':'#c9d8ee','--sidebar':'#d8e4f4','--topbar':'#d8e4f4','--card':'#e3edf8','--card-border':'#a9c2e2','--sidebar-border':'#a9c2e2','--txt':'#152232','--dim':'#3b506e','--label':'#6c809e','--input-bg':'#edf3fb','--input-border':'#a9c2e2','--accent':'#14457e','--accent-hover':'#0f3a6b','--accent-light':'#cfe0f3' },
  verde:   { '--bg':'#c6dfce','--sidebar':'#d6ebde','--topbar':'#d6ebde','--card':'#e2f1e8','--card-border':'#a8ccb6','--sidebar-border':'#a8ccb6','--txt':'#13251b','--dim':'#3c5a48','--label':'#6c8a78','--input-bg':'#ecf6f0','--input-border':'#a8ccb6','--accent':'#1f6b4a','--accent-hover':'#17543a','--accent-light':'#cfeada' },
  vinho:   { '--bg':'#dcaeae','--sidebar':'#e6c4c4','--topbar':'#e6c4c4','--card':'#eed6d6','--card-border':'#cd9a9a','--sidebar-border':'#cd9a9a','--txt':'#331717','--dim':'#5e4040','--label':'#926868','--input-bg':'#f3e2e2','--input-border':'#cd9a9a','--accent':'#8f2d2d','--accent-hover':'#732222','--accent-light':'#e7c6c6' },
  grafite: { '--bg':'#cbd2dc','--sidebar':'#dbe0e8','--topbar':'#dbe0e8','--card':'#e6eaf0','--card-border':'#b3bdcb','--sidebar-border':'#b3bdcb','--txt':'#18222e','--dim':'#4a586b','--label':'#778499','--input-bg':'#eef1f6','--input-border':'#b3bdcb','--accent':'#3a4a5e','--accent-hover':'#2c3a4a','--accent-light':'#dbe1ea' },
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
