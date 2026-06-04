/* ===== Proteção de acesso ===== */
if (!window.Auth || !Auth.token) {
  window.location.href = 'Login.html';
}
// Quem não é aluno vai para o painel de admin
if (window.Auth && Auth.usuario && Auth.usuario.nivel && Auth.usuario.nivel !== 'aluno') {
  window.location.href = 'admin.html';
}

/* ===== Helpers ===== */
function dataCurta(v) { return v ? String(v).slice(0, 10) : ''; }
function lerArquivoBase64(file) {
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file); });
}
function formatarCpf(d) {
  d = (d || '').replace(/\D/g, '').slice(0, 11);
  return d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}
function calcularIdade(nascStr) {
  if (!nascStr) return '';
  const n = new Date(nascStr + 'T12:00:00');
  if (isNaN(n)) return '';
  const hoje = new Date();
  let idade = hoje.getFullYear() - n.getFullYear();
  const m = hoje.getMonth() - n.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < n.getDate())) idade--;
  return idade >= 0 ? `${idade} anos` : '';
}

/* ===== UI ===== */
function msg(el, text, type) { el.textContent = text; el.className = 'form-msg show ' + type; }
function toast(text, type = 'info', duration = 3000) {
  const wrap = document.getElementById('toastWrap');
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<span>${text}</span><button class="toast-close" aria-label="Fechar">✕</button>`;
  el.querySelector('.toast-close').addEventListener('click', () => el.remove());
  wrap.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 300); }, duration);
}

/* ===== Topo / sair ===== */
(function () {
  const u = Auth.usuario || {};
  const primeiro = (u.nome || 'Aluno').split(' ')[0];
  document.getElementById('topName').textContent = primeiro;
  document.getElementById('topAva').textContent = (u.nome || 'A').trim()[0].toUpperCase();
})();
document.querySelectorAll('.side-item.danger').forEach(a => a.addEventListener('click', e => { e.preventDefault(); Auth.sair(); }));

/* ===== Tema (por usuário) ===== */
aplicarTema(temaSalvo());

/* ===== Menu do nome (dropdown) ===== */
(function () {
  const trigger  = document.getElementById('adminTrigger');
  const dropdown = document.getElementById('adminDropdown');
  if (!trigger) return;
  const fechar = () => { dropdown.classList.remove('show'); trigger.setAttribute('aria-expanded', 'false'); };
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const abrir = !dropdown.classList.contains('show');
    dropdown.classList.toggle('show', abrir);
    trigger.setAttribute('aria-expanded', String(abrir));
  });
  document.addEventListener('click', (e) => { if (!document.getElementById('adminMenu').contains(e.target)) fechar(); });
  document.getElementById('ddSair').addEventListener('click', () => Auth.sair());
  document.getElementById('ddVisual').addEventListener('click', () => { fechar(); modalVisual.classList.add('show'); });
})();

/* ===== Modal de visual ===== */
const modalVisual = document.getElementById('modalVisual');
document.getElementById('visualClose').addEventListener('click', () => modalVisual.classList.remove('show'));
modalVisual.addEventListener('click', e => { if (e.target === modalVisual) modalVisual.classList.remove('show'); });
document.getElementById('temaGrid').addEventListener('click', e => {
  const opt = e.target.closest('.tema-opt');
  if (!opt) return;
  aplicarTema(opt.dataset.tema);
  toast('Visual atualizado.', 'ok', 1500);
});

/* ===== Logo volta ao Início ===== */
const logoHome = document.getElementById('logoHome');
if (logoHome) logoHome.addEventListener('click', () => openPanel('inicio'));

/* ===== Sessão de 2 horas ===== */
iniciarSessaoTimer();

/* ===== Navegação ===== */
const navItems = document.querySelectorAll('.side-item[data-panel]');
const panels   = document.querySelectorAll('.panel');
function openPanel(id) {
  panels.forEach(p => p.classList.toggle('active', p.id === id));
  navItems.forEach(b => b.classList.toggle('active', b.dataset.panel === id));
  closeMenu();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  try { localStorage.setItem('saar_painel_aluno', id); } catch (e) {}
  if (id === 'materiais') carregarMateriais();
  if (id === 'horario')   carregarHorario();
}
navItems.forEach(b => {
  b.addEventListener('click', () => {
    const panel = b.dataset.panel;
    if (panel === 'ensino') {
      document.getElementById('subEnsino').classList.toggle('open');
      navItems.forEach(i => i.classList.remove('active'));
      b.classList.add('active');
      document.querySelectorAll('.sub-item').forEach(x => x.classList.remove('active'));
      return;
    }
    document.getElementById('subEnsino').classList.remove('open');
    document.querySelectorAll('.sub-item').forEach(x => x.classList.remove('active'));
    openPanel(panel);
  });
});
document.querySelectorAll('.sub-item[data-sub]').forEach(s => {
  s.addEventListener('click', () => {
    document.querySelectorAll('.sub-item').forEach(x => x.classList.remove('active'));
    s.classList.add('active');
    openPanel(s.dataset.sub);
    document.getElementById('subEnsino').classList.add('open');
    document.getElementById('btnEnsino').classList.add('active');
  });
});

/* ===== Menu mobile ===== */
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
function closeMenu() { sidebar.classList.remove('open'); overlay.classList.remove('show'); }
document.getElementById('menuToggle').addEventListener('click', () => { sidebar.classList.add('open'); overlay.classList.add('show'); });
overlay.addEventListener('click', closeMenu);

/* ===== Meu perfil ===== */
const CARO_CORES = ['#1d4ed8','#0f766e','#7c3aed','#b45309','#be123c','#065f46'];
function iniciais(nome) { return (nome || '?').trim().split(/\s+/).slice(0,2).map(n => n[0]).join('').toUpperCase(); }

document.getElementById('meu-cpf').addEventListener('input', function() { this.value = formatarCpf(this.value); });
document.getElementById('meu-tel').addEventListener('input', function() {
  let v = this.value.replace(/\D/g,'').slice(0,11);
  if (v.length > 10) v = v.replace(/^(\d{2})(\d{5})(\d{4}).*/,'($1) $2-$3');
  else if (v.length > 6) v = v.replace(/^(\d{2})(\d{4})(\d*)/,'($1) $2-$3');
  else if (v.length > 2) v = v.replace(/^(\d{2})(\d*)/,'($1) $2');
  this.value = v;
});
document.getElementById('meu-nasc').addEventListener('change', function() {
  document.getElementById('meu-idade').value = calcularIdade(this.value);
});

async function carregarMeu() {
  try {
    const u = await api.me.ler();
    const cor = u.turma ? CARO_CORES[(u.turma - 1) % CARO_CORES.length] : '#1d4ed8';
    document.getElementById('alNomeTopo').textContent = u.nome || '—';
    document.getElementById('alTurmaTopo').textContent = u.turma ? `Turma ${u.turma}` : 'Aluno';
    document.getElementById('alTurmaTopo').style.color = cor;
    const foto = document.getElementById('alFoto');
    foto.style.setProperty('--turma-cor', cor);
    foto.innerHTML = u.foto
      ? `<img src="${u.foto}" alt="${u.nome}">`
      : `<span class="caro-iniciais" style="font-size:2.2rem">${iniciais(u.nome)}</span>`;

    document.getElementById('meu-nome').value  = u.nome || '';
    document.getElementById('meu-cpf').value   = formatarCpf(u.cpf);
    document.getElementById('meu-nasc').value  = dataCurta(u.nasc);
    document.getElementById('meu-idade').value = calcularIdade(dataCurta(u.nasc));
    document.getElementById('meu-tel').value   = u.telefone || '';
    document.getElementById('meu-email').value = u.email || '';
  } catch (e) { toast('Erro ao carregar seus dados: ' + e.message, 'err'); }
}
carregarMeu();

document.getElementById('formMeu').addEventListener('submit', async () => {
  const nome  = document.getElementById('meu-nome').value.trim();
  const cpf   = document.getElementById('meu-cpf').value.trim();
  const nasc  = document.getElementById('meu-nasc').value;
  const tel   = document.getElementById('meu-tel').value.trim();
  const email = document.getElementById('meu-email').value.trim();
  const m     = document.getElementById('msgMeu');
  if (!nome) { msg(m, 'O nome é obrigatório.', 'err'); return; }
  try {
    const u = await api.me.salvar({ nome, cpf, data_nascimento: nasc || null, telefone: tel, email });
    Auth.usuario = { ...(Auth.usuario || {}), nome: u.nome };
    document.getElementById('alNomeTopo').textContent = u.nome;
    document.getElementById('topName').textContent = (u.nome || '').split(' ')[0];
    document.getElementById('topAva').textContent = iniciais(u.nome)[0] || 'A';
    document.getElementById('meu-idade').value = calcularIdade(dataCurta(u.nasc));
    msg(m, 'Dados salvos com sucesso!', 'ok');
  } catch (e) { msg(m, e.message, 'err'); }
});

/* ===== Materiais (ver/baixar) ===== */
let materiaisCache = [];
function normalizarMaterial(m) {
  return {
    id: m.id, nome: m.nome, descricao: m.descricao || '',
    turma: m.turma || '—', tipo: m.tipo || 'Outro',
    arquivo_nome: m.arquivo_nome || null, temArquivo: !!m.tem_arquivo,
    data: m.criado_em ? new Date(m.criado_em).toLocaleDateString('pt-BR') : '',
  };
}
const API_BASE = window.SAAR_API || '';
function urlArquivo(id, download) { return `${API_BASE}/api/materiais/${id}/arquivo${download ? '?download=1' : ''}`; }
function ehImagem(nome) { return /\.(png|jpe?g|gif|webp|bmp|svg|avif)$/i.test(nome || ''); }
function ehPdf(nome)    { return /\.pdf$/i.test(nome || ''); }
let materiaisCarregado = false;
async function carregarMateriais() {
  if (materiaisCarregado) {
    renderMateriais(document.getElementById('buscaMaterial').value);
  } else {
    document.getElementById('matEmpty').style.display = 'block';
    document.getElementById('matEmpty').textContent = 'Carregando materiais…';
  }
  try {
    const lista = await api.materiais.listar();
    materiaisCache = lista.map(normalizarMaterial);
    materiaisCarregado = true;
    document.getElementById('matEmpty').textContent = 'Nenhum material disponível ainda.';
    renderMateriais(document.getElementById('buscaMaterial').value);
  } catch (e) {
    toast('Erro ao carregar materiais: ' + e.message, 'err');
  }
}
function renderMateriais(filtro = '') {
  filtro = (filtro || '').toLowerCase();
  const body  = document.getElementById('matBody');
  const empty = document.getElementById('matEmpty');
  const lista = materiaisCache.filter(m => !filtro || m.nome.toLowerCase().includes(filtro) || (m.turma || '').toLowerCase().includes(filtro));
  body.innerHTML = lista.map(m => `
    <tr>
      <td>
        <button class="mat-abrir" data-id="${m.id}" title="Abrir material">
          <div class="mat-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
          <span>${m.nome}</span>
        </button>
      </td>
      <td>${m.turma}</td>
      <td><span class="badge">${m.tipo}</span></td>
      <td>${m.data}</td>
      <td>
        <button class="row-btn mat-abrir-btn" data-id="${m.id}" title="Abrir">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
      </td>
    </tr>`).join('');
  empty.style.display = lista.length ? 'none' : 'block';
  body.querySelectorAll('.mat-abrir, .mat-abrir-btn').forEach(el => el.addEventListener('click', () => abrirMaterial(Number(el.dataset.id))));
}

const modalMaterial = document.getElementById('modalMaterial');

function abrirMaterial(id) {
  const m = materiaisCache.find(x => x.id === id);
  if (!m) return;
  document.getElementById('matVerNome').textContent = m.nome;
  document.getElementById('matVerMeta').textContent = `${m.tipo} · ${m.turma} · ${m.data}`;
  document.getElementById('matVerDesc').textContent = m.descricao || 'Sem descrição.';
  const prev   = document.getElementById('matVerPreview');
  const baixar = document.getElementById('matVerBaixar');
  const abrir  = document.getElementById('matVerAbrir');

  if (!m.temArquivo) {
    prev.innerHTML = '<div class="mat-sem-arquivo">Nenhum arquivo anexado a este material.</div>';
    baixar.style.display = 'none';
    abrir.style.display = 'none';
  } else {
    const ver = urlArquivo(m.id, false);
    baixar.style.display = 'inline-flex';
    baixar.href = urlArquivo(m.id, true);
    baixar.removeAttribute('download');
    abrir.style.display = 'inline-flex';
    abrir.href = ver;
    if (ehImagem(m.arquivo_nome)) {
      prev.innerHTML = `<img src="${ver}" alt="${m.nome}" class="mat-preview-img">`;
    } else if (ehPdf(m.arquivo_nome)) {
      prev.innerHTML = `<iframe src="${ver}" class="mat-preview-pdf" title="Pré-visualização"></iframe>
        <div class="mat-preview-aviso">No celular o PDF pode não aparecer aqui — use <strong>Abrir em nova aba</strong>.</div>`;
    } else {
      prev.innerHTML = `<div class="mat-sem-arquivo"><strong>${m.arquivo_nome || 'Arquivo'}</strong><br>Use os botões abaixo para abrir ou baixar.</div>`;
    }
  }
  modalMaterial.classList.add('show');
}
function fecharMaterial() { modalMaterial.classList.remove('show'); }
document.getElementById('matVerClose').addEventListener('click', fecharMaterial);
modalMaterial.addEventListener('click', e => { if (e.target === modalMaterial) fecharMaterial(); });
document.getElementById('buscaMaterial').addEventListener('input', e => renderMateriais(e.target.value));

/* ===== Horário (somente leitura) ===== */
const turmaCores = { 'Turma 1':'#1d4ed8','Turma 2':'#0f766e','Turma 3':'#7c3aed','Turma 4':'#b45309','Turma 5':'#be123c','Turma 6':'#065f46' };
const horarioPadrao = [
  { turno: 'Manhã', periodo: '1º', horario: '08:00 - 08:45', seg: 'Turma 1', ter: 'Turma 1', qua: 'Turma 3', qui: 'Turma 3', sex: 'Turma 5' },
  { turno: '',      periodo: '2º', horario: '08:45 - 09:30', seg: 'Turma 1', ter: 'Turma 1', qua: 'Turma 3', qui: 'Turma 3', sex: 'Turma 5' },
  { turno: '',      periodo: '3º', horario: '09:30 - 10:15', seg: 'Turma 1', ter: 'Turma 1', qua: 'Turma 3', qui: 'Turma 3', sex: 'Turma 5' },
  { turno: '',      periodo: '4º', horario: '10:15 - 11:00', seg: 'Turma 1', ter: 'Turma 1', qua: 'Turma 3', qui: 'Turma 3', sex: 'Turma 5' },
  { turno: 'Tarde', periodo: '1º', horario: '14:00 - 14:45', seg: 'Turma 2', ter: 'Turma 2', qua: 'Turma 4', qui: 'Turma 4', sex: 'Turma 6' },
  { turno: '',      periodo: '2º', horario: '14:45 - 15:30', seg: 'Turma 2', ter: 'Turma 2', qua: 'Turma 4', qui: 'Turma 4', sex: 'Turma 6' },
  { turno: '',      periodo: '3º', horario: '15:30 - 16:15', seg: 'Turma 2', ter: 'Turma 2', qua: 'Turma 4', qui: 'Turma 4', sex: 'Turma 6' },
  { turno: '',      periodo: '4º', horario: '16:15 - 17:00', seg: 'Turma 2', ter: 'Turma 2', qua: 'Turma 4', qui: 'Turma 4', sex: 'Turma 6' },
];
function horChave() { return `${new Date().getFullYear()}_${document.getElementById('horMes').value}`; }
async function carregarHorario() {
  let dados;
  try {
    const r = await api.horarios.buscar(horChave());
    dados = (Array.isArray(r) && r.length === 8) ? r : horarioPadrao;
  } catch (e) { dados = horarioPadrao; }
  renderHorario(dados);
}
function renderHorario(dados) {
  const body = document.getElementById('horBody');
  const dias = ['seg','ter','qua','qui','sex'];
  let rows = '';
  dados.forEach((r, i) => {
    let turnoCell = '';
    if (i === 0) turnoCell = `<td class="hor-td-turno manha" rowspan="4">Manhã</td>`;
    if (i === 4) turnoCell = `<td class="hor-td-turno tarde" rowspan="4">Tarde</td>`;
    const diasCells = dias.map(d => {
      const val = r[d] || '';
      const cor = turmaCores[val.trim()];
      const sty = cor ? ` style="--cell-color:${cor}"` : '';
      const cls = cor ? ' has-color' : '';
      return `<td class="hor-cell${cls}"${sty}>${val}</td>`;
    }).join('');
    rows += `<tr${i === 4 ? ' class="separator"' : ''}>${turnoCell}<td class="hor-td-periodo">${r.periodo}</td><td class="hor-td-horario">${r.horario}</td>${diasCells}</tr>`;
  });
  body.innerHTML = rows;
}
document.getElementById('horMes').addEventListener('change', carregarHorario);
document.getElementById('horMes').value = String(new Date().getMonth());

/* ===== Prefetch em segundo plano (deixa pronto) ===== */
carregarMateriais();
carregarHorario();

/* ===== Restaura a última aba aberta ===== */
(function restaurarPainel() {
  let id;
  try { id = localStorage.getItem('saar_painel_aluno'); } catch (e) {}
  if (!id || id === 'inicio') return;
  const sub = document.querySelector(`.sub-item[data-sub="${id}"]`);
  if (sub) { sub.click(); return; }
  const top = document.querySelector(`.side-item[data-panel="${id}"]:not(.has-sub)`);
  if (top) top.click();
})();
