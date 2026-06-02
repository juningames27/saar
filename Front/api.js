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
    window.location.href = "Login.html";
  },
};

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

  // Atalhos de domínio
  admins:    { listar: () => api.get("/api/admins"), criar: (b) => api.post("/api/admins", b), editar: (id, b) => api.put("/api/admins/" + id, b), remover: (id) => api.del("/api/admins/" + id) },
  alunos:    { listar: () => api.get("/api/alunos"), criar: (b) => api.post("/api/alunos", b), editar: (id, b) => api.put("/api/alunos/" + id, b), remover: (id) => api.del("/api/alunos/" + id) },
  chamadas:  { listar: () => api.get("/api/chamadas"), buscar: (data, turma) => api.get(`/api/chamadas/${data}/${turma}`), salvar: (b) => api.post("/api/chamadas", b), remover: (id) => api.del("/api/chamadas/" + id) },
  horarios:  { buscar: (chave) => api.get("/api/horarios/" + chave), salvar: (chave, dados) => api.put("/api/horarios/" + chave, { dados }), resetar: (chave) => api.del("/api/horarios/" + chave) },
  materiais: { listar: () => api.get("/api/materiais"), criar: (b) => api.post("/api/materiais", b), remover: (id) => api.del("/api/materiais/" + id) },
};

window.api = api;
window.Auth = Auth;
