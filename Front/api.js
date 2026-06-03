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
