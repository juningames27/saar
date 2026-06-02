/* ===== Proteção de acesso ===== */
if (!window.Auth || !Auth.token) {
  window.location.href = 'Login.html';
}

/* ===== Helpers ===== */
function lerArquivoBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
function formatarCpf(d) {
  d = (d || '').replace(/\D/g, '').slice(0, 11);
  return d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}
function dataCurta(v) { return v ? String(v).slice(0, 10) : ''; }

/* ===== Utilitários de UI ===== */
function msg(el, text, type) {
  el.textContent = text;
  el.className = 'form-msg show ' + type;
}

function toast(text, type = 'info', duration = 3000) {
  const wrap = document.getElementById('toastWrap');
  const el   = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<span>${text}</span><button class="toast-close" aria-label="Fechar">✕</button>`;
  el.querySelector('.toast-close').addEventListener('click', () => el.remove());
  wrap.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 300); }, duration);
}

function confirmar(texto, onOk) {
  document.getElementById('confirmMsg').textContent = texto;
  const modalC = document.getElementById('modalConfirm');
  const btnOk  = document.getElementById('confirmOk');
  const btnCan = document.getElementById('confirmCancel');
  modalC.classList.add('show');
  const fechar = () => modalC.classList.remove('show');
  const handleOk = () => { fechar(); btnOk.removeEventListener('click', handleOk); btnCan.removeEventListener('click', fechar); onOk(); };
  btnOk.addEventListener('click', handleOk);
  btnCan.addEventListener('click', fechar);
  modalC.addEventListener('click', e => { if (e.target === modalC) fechar(); }, { once: true });
}

/* ===== Usuário logado (nome, avatar, sair) ===== */
(function aplicarUsuarioLogado() {
  const u = window.Auth && Auth.usuario;
  if (!u) return;
  const primeiro = (u.nome || '').split(' ')[0] || u.nome;
  const top  = document.getElementById('topName');
  const prof = document.getElementById('profName');
  const ava  = document.getElementById('topAva');
  if (top)  top.textContent  = primeiro;
  if (prof) prof.textContent = primeiro;
  if (ava)  ava.textContent  = (u.nome || '?').trim()[0].toUpperCase();
})();

document.querySelectorAll('.side-item.danger').forEach(a => {
  a.addEventListener('click', (e) => { e.preventDefault(); Auth.sair(); });
});

/* ===== Menu do nome (dropdown no topo) ===== */
(function () {
  const trigger  = document.getElementById('adminTrigger');
  const dropdown = document.getElementById('adminDropdown');
  if (!trigger) return;

  const abrir  = () => { dropdown.classList.add('show'); trigger.setAttribute('aria-expanded', 'true'); };
  const fechar = () => { dropdown.classList.remove('show'); trigger.setAttribute('aria-expanded', 'false'); };

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.contains('show') ? fechar() : abrir();
  });
  document.addEventListener('click', (e) => {
    if (!document.getElementById('adminMenu').contains(e.target)) fechar();
  });
  document.getElementById('ddSair').addEventListener('click', () => Auth.sair());
  document.getElementById('ddVisual').addEventListener('click', () => { fechar(); abrirVisual(); });
})();

/* ===== Temas de cor (configuração de visual) ===== */
const TEMAS = {
  azul:     { '--bg':'#0f172a','--sidebar':'#111827','--topbar':'#111827','--card':'#1e293b','--card-border':'#334155','--sidebar-border':'#1e293b','--txt':'#f8fafc','--dim':'#cbd5e1','--label':'#94a3b8','--input-bg':'#0f172a','--input-border':'#475569' },
  vermelho: { '--bg':'#1a1012','--sidebar':'#211417','--topbar':'#211417','--card':'#2a181c','--card-border':'#3d2329','--sidebar-border':'#2a181c','--txt':'#f8fafc','--dim':'#e7cdd0','--label':'#b08a90','--input-bg':'#1a1012','--input-border':'#5a3540' },
  roxo:     { '--bg':'#14101f','--sidebar':'#1a1230','--topbar':'#1a1230','--card':'#221a3a','--card-border':'#352a52','--sidebar-border':'#221a3a','--txt':'#f8fafc','--dim':'#d6cce7','--label':'#9b8ab0','--input-bg':'#14101f','--input-border':'#4a3d6b' },
  preto:    { '--bg':'#0a0a0a','--sidebar':'#121212','--topbar':'#121212','--card':'#1a1a1a','--card-border':'#2a2a2a','--sidebar-border':'#1f1f1f','--txt':'#f5f5f5','--dim':'#cccccc','--label':'#888888','--input-bg':'#0a0a0a','--input-border':'#3a3a3a' },
  branco:   { '--bg':'#f1f5f9','--sidebar':'#ffffff','--topbar':'#ffffff','--card':'#ffffff','--card-border':'#e2e8f0','--sidebar-border':'#e2e8f0','--txt':'#1e293b','--dim':'#475569','--label':'#94a3b8','--input-bg':'#f8fafc','--input-border':'#cbd5e1' },
};
const TEMA_KEY = 'saar_tema';

function aplicarTema(nome) {
  const t = TEMAS[nome] || TEMAS.azul;
  const raiz = document.documentElement;
  Object.entries(t).forEach(([k, v]) => raiz.style.setProperty(k, v));
  localStorage.setItem(TEMA_KEY, nome);
  document.querySelectorAll('.tema-opt').forEach(b => b.classList.toggle('active', b.dataset.tema === nome));
}
aplicarTema(localStorage.getItem(TEMA_KEY) || 'azul');

const modalVisual = document.getElementById('modalVisual');
function abrirVisual() {
  document.querySelectorAll('.tema-opt').forEach(b =>
    b.classList.toggle('active', b.dataset.tema === (localStorage.getItem(TEMA_KEY) || 'azul')));
  modalVisual.classList.add('show');
}
function fecharVisual() { modalVisual.classList.remove('show'); }
document.getElementById('visualClose').addEventListener('click', fecharVisual);
modalVisual.addEventListener('click', e => { if (e.target === modalVisual) fecharVisual(); });
document.getElementById('temaGrid').addEventListener('click', e => {
  const opt = e.target.closest('.tema-opt');
  if (!opt) return;
  aplicarTema(opt.dataset.tema);
  toast('Visual atualizado.', 'ok', 1500);
});

/* ===== Troca de painéis (menu lateral) ===== */
const navItems = document.querySelectorAll('.side-item[data-panel]');
const panels   = document.querySelectorAll('.panel');

function openPanel(id) {
  panels.forEach(p => p.classList.toggle('active', p.id === id));
  navItems.forEach(b => b.classList.toggle('active', b.dataset.panel === id));
  closeMenu();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (id === 'materiais')       carregarMateriais();
  if (id === 'carometro')       carregarAlunos();
  if (id === 'chamada')         carregarAlunos();
  if (id === 'administradores') carregarAdmins();
}

navItems.forEach(b => {
  b.addEventListener('click', () => {
    const panel = b.dataset.panel;

    if (panel === 'ensino') {
      document.getElementById('subEnsino').classList.toggle('open');
      document.getElementById('subAlunos').classList.remove('open');
      navItems.forEach(item => item.classList.remove('active'));
      b.classList.add('active');
      document.querySelectorAll('.sub-item').forEach(x => x.classList.remove('active'));
      return;
    }

    if (panel === 'alunos') {
      document.getElementById('subAlunos').classList.toggle('open');
      document.getElementById('subEnsino').classList.remove('open');
      navItems.forEach(item => item.classList.remove('active'));
      b.classList.add('active');
      document.querySelectorAll('.sub-item').forEach(x => x.classList.remove('active'));
      return;
    }

    document.getElementById('subEnsino').classList.remove('open');
    document.getElementById('subAlunos').classList.remove('open');
    document.querySelectorAll('.sub-item').forEach(x => x.classList.remove('active'));
    openPanel(panel);
  });
});

/* Sub-itens (Ensino e Alunos) */
const subMenuMap = {
  materiais:         { sub: 'subEnsino', pai: 'btnEnsino' },
  horario:           { sub: 'subEnsino', pai: 'btnEnsino' },
  chamada:           { sub: 'subEnsino', pai: 'btnEnsino' },
  'cadastrar-aluno': { sub: 'subAlunos', pai: 'btnAlunos' },
  carometro:         { sub: 'subAlunos', pai: 'btnAlunos' },
};

document.querySelectorAll('.sub-item[data-sub]').forEach(s => {
  s.addEventListener('click', () => {
    document.querySelectorAll('.sub-item').forEach(x => x.classList.remove('active'));
    s.classList.add('active');
    openPanel(s.dataset.sub);
    const map = subMenuMap[s.dataset.sub];
    if (map) {
      document.getElementById(map.sub).classList.add('open');
      document.getElementById(map.pai).classList.add('active');
    }
  });
});

/* ===== Menu mobile ===== */
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
function openMenu()  { sidebar.classList.add('open');    overlay.classList.add('show'); }
function closeMenu() { sidebar.classList.remove('open'); overlay.classList.remove('show'); }
document.getElementById('menuToggle').addEventListener('click', openMenu);
overlay.addEventListener('click', closeMenu);

/* ===== Foto de perfil (preview local) ===== */
const avatarInput = document.getElementById('avatarInput');
document.getElementById('avatarEdit').addEventListener('click', () => avatarInput.click());
avatarInput.addEventListener('change', () => {
  const file = avatarInput.files[0];
  if (!file) return;
  document.getElementById('avatar').innerHTML = '<img src="' + URL.createObjectURL(file) + '" alt="Foto de perfil">';
});

/* ===== Salvar perfil ===== */
document.getElementById('formPerfil').addEventListener('submit', () => {
  const nome = document.getElementById('pf-nome').value.trim();
  if (nome) {
    document.getElementById('profName').textContent = nome;
    document.getElementById('topName').textContent  = nome.split(' ')[0];
  }
  msg(document.getElementById('msgPerfil'), 'Perfil pronto para envio. Conecte ao backend para salvar.', 'info');
});

/* ===== Modal editar senha ===== */
const modal = document.getElementById('modalSenha');
function openModal()  { modal.classList.add('show'); }
function closeModal() { modal.classList.remove('show'); }
document.getElementById('btnEditarSenha').addEventListener('click', openModal);
document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalCancel').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

/* ===== Mostrar/esconder senha ===== */
const eyeOpen   = '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>';
const eyeClosed = '<path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.5 13.5 0 0 0 2 12s3.5 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><line x1="2" y1="2" x2="22" y2="22"/>';
document.querySelectorAll('.toggle-pw').forEach(btn => {
  btn.addEventListener('click', () => {
    const input   = document.getElementById(btn.dataset.target);
    const svg     = btn.querySelector('svg');
    const showing = input.type === 'text';
    input.type    = showing ? 'password' : 'text';
    svg.innerHTML = showing ? eyeOpen : eyeClosed;
    btn.setAttribute('aria-label', showing ? 'Mostrar senha' : 'Esconder senha');
  });
});

document.getElementById('formSenha').addEventListener('submit', () => {
  const nova = document.getElementById('pw-nova').value;
  const conf = document.getElementById('pw-conf').value;
  const m    = document.getElementById('msgSenha');
  if (nova.length < 6) { msg(m, 'A senha deve ter pelo menos 6 caracteres.', 'err'); return; }
  if (nova !== conf)   { msg(m, 'As senhas não coincidem.', 'err'); return; }
  msg(m, 'Senha validada. Conecte ao backend para salvar a alteração.', 'ok');
});

/* ===== Materiais (API + arquivo/preview) ===== */
let materiaisCache = [];
let matFileData = null;
let matFileName = null;
const LIMITE_MB = 5;

function normalizarMaterial(m) {
  return {
    id: m.id, nome: m.nome, descricao: m.descricao || '',
    turma: m.turma || '—', tipo: m.tipo || 'Outro',
    arquivo_nome: m.arquivo_nome || null,
    arquivo_url: m.arquivo_url || null,
    data: m.criado_em ? new Date(m.criado_em).toLocaleDateString('pt-BR') : '',
  };
}

async function carregarMateriais() {
  try {
    const lista = await api.materiais.listar();
    materiaisCache = lista.map(normalizarMaterial);
    renderMateriais(document.getElementById('buscaMaterial').value);
  } catch (e) {
    toast('Erro ao carregar materiais: ' + e.message, 'err');
  }
}

function renderMateriais(filtro = '') {
  filtro = (filtro || '').toLowerCase();
  const body  = document.getElementById('matBody');
  const empty = document.getElementById('matEmpty');
  const lista = materiaisCache.filter(m =>
    !filtro || m.nome.toLowerCase().includes(filtro) || (m.turma || '').toLowerCase().includes(filtro));

  body.innerHTML = lista.map(m => `
    <tr>
      <td>
        <button class="mat-abrir" data-id="${m.id}" title="Abrir material">
          <div class="mat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <span>${m.nome}</span>
        </button>
      </td>
      <td>${m.turma}</td>
      <td><span class="badge">${m.tipo}</span></td>
      <td>${m.data}</td>
      <td>
        <div class="row-actions">
          <button class="row-btn mat-abrir-btn" data-id="${m.id}" title="Abrir">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <button class="row-btn danger mat-del" title="Excluir" data-id="${m.id}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  empty.style.display = lista.length ? 'none' : 'block';

  body.querySelectorAll('.mat-abrir, .mat-abrir-btn').forEach(el => {
    el.addEventListener('click', () => abrirMaterial(Number(el.dataset.id)));
  });
  body.querySelectorAll('.mat-del').forEach(btn => {
    btn.addEventListener('click', () => {
      const mat = materiaisCache.find(x => x.id === Number(btn.dataset.id));
      confirmar(`Excluir o material "${mat?.nome}"?`, async () => {
        try { await api.materiais.remover(Number(btn.dataset.id)); await carregarMateriais(); toast('Material excluído.', 'ok'); }
        catch (e) { toast(e.message, 'err'); }
      });
    });
  });
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
  const url    = m.arquivo_url;

  if (!url) {
    prev.innerHTML = '<div class="mat-sem-arquivo">Nenhum arquivo anexado a este material.</div>';
    baixar.style.display = 'none';
  } else {
    baixar.style.display = 'inline-flex';
    baixar.href = url;
    baixar.setAttribute('download', m.arquivo_nome || 'arquivo');
    if (url.startsWith('data:image/')) {
      prev.innerHTML = `<img src="${url}" alt="${m.nome}" class="mat-preview-img">`;
    } else if (url.startsWith('data:application/pdf')) {
      prev.innerHTML = `<iframe src="${url}" class="mat-preview-pdf" title="Pré-visualização"></iframe>`;
    } else {
      prev.innerHTML = `<div class="mat-sem-arquivo"><strong>${m.arquivo_nome || 'Arquivo'}</strong><br>Sem pré-visualização para este tipo. Use o botão abaixo para baixar.</div>`;
    }
  }
  modalMaterial.classList.add('show');
}
function fecharMaterial() { modalMaterial.classList.remove('show'); }
document.getElementById('matVerClose').addEventListener('click', fecharMaterial);
modalMaterial.addEventListener('click', e => { if (e.target === modalMaterial) fecharMaterial(); });

document.getElementById('buscaMaterial').addEventListener('input', e => renderMateriais(e.target.value));
document.getElementById('btnNovoMaterial').addEventListener('click', () => {
  document.getElementById('formMaterialWrap').style.display = 'block';
  document.getElementById('btnNovoMaterial').style.display  = 'none';
});

function resetFormMaterial() {
  document.getElementById('formMaterialWrap').style.display = 'none';
  document.getElementById('btnNovoMaterial').style.display  = 'flex';
  document.getElementById('formMaterial').reset();
  matFileData = null; matFileName = null;
  document.getElementById('fileLabel').innerHTML = 'Arraste um arquivo ou <span>clique para selecionar</span>';
}
document.getElementById('btnCancelarMaterial').addEventListener('click', resetFormMaterial);

const fileDrop  = document.getElementById('fileDrop');
const fileInput = document.getElementById('mat-arquivo');
async function processarArquivo(file) {
  if (!file) return;
  if (file.size > LIMITE_MB * 1024 * 1024) { toast(`Arquivo muito grande (máx. ${LIMITE_MB} MB).`, 'err', 4000); return; }
  matFileName = file.name;
  matFileData = await lerArquivoBase64(file);
  document.getElementById('fileLabel').innerHTML = '<strong>' + file.name + '</strong>';
}
fileDrop.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => processarArquivo(fileInput.files[0]));
fileDrop.addEventListener('dragover',  e => { e.preventDefault(); fileDrop.classList.add('drag'); });
fileDrop.addEventListener('dragleave', () => fileDrop.classList.remove('drag'));
fileDrop.addEventListener('drop', e => {
  e.preventDefault(); fileDrop.classList.remove('drag');
  if (e.dataTransfer.files[0]) processarArquivo(e.dataTransfer.files[0]);
});

document.getElementById('formMaterial').addEventListener('submit', async () => {
  const nome  = document.getElementById('mat-nome').value.trim();
  const desc  = document.getElementById('mat-desc').value.trim();
  const turma = document.getElementById('mat-turma').value.trim();
  const tipo  = document.getElementById('mat-tipo').value;
  const m     = document.getElementById('msgMaterial');
  if (!nome || !turma || !tipo) { msg(m, 'Preencha nome, turma e tipo antes de enviar.', 'err'); return; }
  try {
    await api.materiais.criar({ nome, descricao: desc, turma, tipo, arquivo_nome: matFileName, arquivo_url: matFileData });
    msg(m, 'Material enviado com sucesso!', 'ok');
    await carregarMateriais();
    setTimeout(resetFormMaterial, 1000);
  } catch (e) { msg(m, e.message, 'err'); }
});

/* ===== Horário (grade editável — localStorage) ===== */
const HOR_KEY = 'saar_horario';
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
const turmaCores = { 'Turma 1':'#1d4ed8','Turma 2':'#0f766e','Turma 3':'#7c3aed','Turma 4':'#b45309','Turma 5':'#be123c','Turma 6':'#065f46' };

function horChave() { return `${HOR_KEY}_${new Date().getFullYear()}_${document.getElementById('horMes').value}`; }
function clonarHorarioPadrao() { return JSON.parse(JSON.stringify(horarioPadrao)); }
function getHorarioData() {
  try { return JSON.parse(localStorage.getItem(horChave())) || clonarHorarioPadrao(); }
  catch (e) { return clonarHorarioPadrao(); }
}
function aplicarCorCelula(cell, valor) {
  const cor = turmaCores[valor.trim()];
  if (cor) { cell.classList.add('has-color'); cell.style.setProperty('--cell-color', cor); }
  else { cell.classList.remove('has-color'); cell.style.removeProperty('--cell-color'); }
}
function renderHorario() {
  const dados = getHorarioData();
  const body = document.getElementById('horBody');
  const dias = ['seg', 'ter', 'qua', 'qui', 'sex'];
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
      return `<td class="hor-cell${cls}"${sty} contenteditable="true" data-row="${i}" data-col="${d}" spellcheck="false">${val}</td>`;
    }).join('');
    rows += `<tr${i === 4 ? ' class="separator"' : ''}>
      ${turnoCell}
      <td class="hor-td-periodo">${r.periodo}</td>
      <td class="hor-td-horario" contenteditable="true" data-row="${i}" data-col="horario" spellcheck="false">${r.horario}</td>
      ${diasCells}
    </tr>`;
  });
  body.innerHTML = rows;
  body.querySelectorAll('.hor-cell').forEach(cell => {
    cell.addEventListener('input', () => { aplicarCorCelula(cell, cell.textContent); salvarHorarioAutomatico(); });
    cell.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); cell.blur(); } });
  });
  body.querySelectorAll('.hor-td-horario[contenteditable]').forEach(cell => {
    cell.addEventListener('input', salvarHorarioAutomatico);
    cell.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); cell.blur(); } });
  });
}
function coletarHorario() {
  const dados = getHorarioData();
  document.querySelectorAll('#horBody [contenteditable][data-row]').forEach(cell => {
    const row = Number(cell.dataset.row);
    const col = cell.dataset.col;
    if (dados[row] && col) dados[row][col] = cell.textContent.trim();
  });
  return dados;
}
function salvarHorarioAutomatico() { localStorage.setItem(horChave(), JSON.stringify(coletarHorario())); }

document.getElementById('btnSalvarHorario').addEventListener('click', () => {
  salvarHorarioAutomatico();
  const m = document.getElementById('msgHorario');
  msg(m, '✓ Horário salvo com sucesso!', 'ok');
  setTimeout(() => m.classList.remove('show'), 2500);
});
document.getElementById('btnResetHorario').addEventListener('click', () => {
  confirmar('Resetar para o horário padrão? As edições salvas serão apagadas.', () => {
    localStorage.removeItem(horChave());
    renderHorario();
    const m = document.getElementById('msgHorario');
    msg(m, 'Horário restaurado para o padrão.', 'info');
    setTimeout(() => m.classList.remove('show'), 2500);
  });
});
document.getElementById('horMes').addEventListener('change', renderHorario);
document.getElementById('horMes').value = String(new Date().getMonth());
(function() {
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const k = localStorage.key(i);
    if (k && k.startsWith(HOR_KEY)) {
      try { const d = JSON.parse(localStorage.getItem(k)); if (Array.isArray(d) && d[0] && ('semana' in d[0] || d.length !== 8)) localStorage.removeItem(k); }
      catch(e) { localStorage.removeItem(k); }
    }
  }
})();
renderHorario();

/* ===== Alunos (API) ===== */
const TURMAS = ['Turma 1','Turma 2','Turma 3','Turma 4','Turma 5','Turma 6'];
let alunosCache = [];
let alunoFotoData = null;
const ALUNO_FOTO_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;

function getAlunos() { return alunosCache; }
function normalizarAluno(a) {
  return {
    id: a.id, cpf: a.cpf, nome: a.nome, email: a.email,
    tel: a.tel ?? a.telefone ?? '',
    nasc: dataCurta(a.nasc ?? a.data_nascimento),
    turma: Number(a.turma), foto: a.foto || null, estrelas: a.estrelas || 0,
  };
}
async function carregarAlunos() {
  try { const lista = await api.alunos.listar(); alunosCache = lista.map(normalizarAluno); renderCarometro(); }
  catch (e) { toast('Erro ao carregar alunos: ' + e.message, 'err'); }
}

document.getElementById('al-cpf').addEventListener('input', function() {
  let v = this.value.replace(/\D/g,'').slice(0,11);
  v = v.replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2');
  this.value = v;
});
document.getElementById('al-tel').addEventListener('input', function() {
  let v = this.value.replace(/\D/g,'').slice(0,11);
  if (v.length > 10) v = v.replace(/^(\d{2})(\d{5})(\d{4}).*/,'($1) $2-$3');
  else if (v.length > 6) v = v.replace(/^(\d{2})(\d{4})(\d*)/,'($1) $2-$3');
  else if (v.length > 2) v = v.replace(/^(\d{2})(\d*)/,'($1) $2');
  this.value = v;
});

const alunoFotoInput = document.getElementById('alunoFotoInput');
document.getElementById('btnFotoAluno').addEventListener('click', () => alunoFotoInput.click());
alunoFotoInput.addEventListener('change', async () => {
  const file = alunoFotoInput.files[0];
  if (!file) return;
  alunoFotoData = await lerArquivoBase64(file);
  document.getElementById('alunoFotoPreview').innerHTML = `<img src="${alunoFotoData}" alt="Foto">`;
});

document.getElementById('formAluno').addEventListener('submit', async () => {
  const nome  = document.getElementById('al-nome').value.trim();
  const nasc  = document.getElementById('al-nasc').value;
  const email = document.getElementById('al-email').value.trim();
  const tel   = document.getElementById('al-tel').value.trim();
  const cpf   = document.getElementById('al-cpf').value.trim();
  const turma = document.getElementById('al-turma').value;
  const m     = document.getElementById('msgAluno');
  if (!nome || !turma || !nasc) { msg(m, 'Preencha ao menos nome, data de nascimento e turma.', 'err'); return; }
  if (!cpf) { msg(m, 'O CPF é obrigatório (será o login do aluno).', 'err'); return; }
  try {
    await api.alunos.criar({ nome, nasc, email, telefone: tel, cpf, turma: Number(turma), foto: alunoFotoData });
    msg(m, `Aluno "${nome}" cadastrado! Login: CPF · senha: data de nascimento (DDMMAAAA).`, 'ok');
    document.getElementById('formAluno').reset();
    alunoFotoData = null;
    document.getElementById('alunoFotoPreview').innerHTML = ALUNO_FOTO_SVG;
    await carregarAlunos();
  } catch (e) { msg(m, e.message, 'err'); }
});

document.querySelector('#formAluno button[type="reset"]').addEventListener('click', () => {
  setTimeout(() => { alunoFotoData = null; document.getElementById('alunoFotoPreview').innerHTML = ALUNO_FOTO_SVG; }, 0);
});

/* ===== Estrelas ===== */
const TOTAL_ESTRELAS = 40;
function renderEstrelas(marcadas) {
  const grid = document.getElementById('maEstrelasGrid');
  grid.dataset.total = marcadas;
  grid.innerHTML = '';
  for (let i = 1; i <= TOTAL_ESTRELAS; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'estrela-btn' + (i <= marcadas ? ' on' : '');
    btn.dataset.i = i;
    btn.innerHTML = '★';
    btn.setAttribute('aria-label', `Estrela ${i}`);
    btn.addEventListener('click', () => {
      const atual = Number(grid.dataset.total);
      renderEstrelas(i === atual ? 0 : i);
    });
    grid.appendChild(btn);
  }
  atualizarContadorEstrelas(marcadas);
}
function atualizarContadorEstrelas(n) {
  const el = document.getElementById('maEstrelasCount');
  const nomes = ['zero','uma','duas','três','quatro','cinco','seis','sete','oito','nove','dez','onze','doze','treze','quatorze','quinze','dezesseis','dezessete','dezoito','dezenove','vinte','vinte e uma','vinte e duas','vinte e três','vinte e quatro','vinte e cinco','vinte e seis','vinte e sete','vinte e oito','vinte e nove','trinta','trinta e uma','trinta e duas','trinta e três','trinta e quatro','trinta e cinco','trinta e seis','trinta e sete','trinta e oito','trinta e nove','quarenta'];
  const label = n <= 40 ? nomes[n] : n;
  el.textContent = `${n} (${label}) estrela${n !== 1 ? 's' : ''}`;
  el.style.color = n === 0 ? 'var(--label)' : '#f59e0b';
}

/* ===== Carômetro ===== */
const CARO_CORES = ['#1d4ed8','#0f766e','#7c3aed','#b45309','#be123c','#065f46'];
let caroTurmaAtiva = 0;
function corTurma(t) { return CARO_CORES[(t - 1) % CARO_CORES.length]; }
function iniciaisAluno(nome) { return nome.trim().split(/\s+/).slice(0,2).map(n => n[0]).join('').toUpperCase(); }
function avatarHTML(aluno, size = 80) {
  const cor = corTurma(aluno.turma);
  if (aluno.foto) return `<div class="caro-avatar" style="width:${size}px;height:${size}px;--turma-cor:${cor}"><img src="${aluno.foto}" alt="${aluno.nome}"></div>`;
  return `<div class="caro-avatar" style="width:${size}px;height:${size}px;--turma-cor:${cor};font-size:${Math.round(size*0.3)}px"><span class="caro-iniciais">${iniciaisAluno(aluno.nome)}</span></div>`;
}
function renderCarometro() {
  const grid  = document.getElementById('caroGrid');
  const empty = document.getElementById('caroEmpty');
  const count = document.getElementById('caroCount');
  document.querySelectorAll('.caro-tab').forEach(t => t.classList.toggle('active', Number(t.dataset.turma) === caroTurmaAtiva));
  const todos  = getAlunos();
  const alunos = caroTurmaAtiva === 0 ? todos : todos.filter(a => a.turma === caroTurmaAtiva);
  count.textContent = alunos.length ? `${alunos.length} aluno${alunos.length > 1 ? 's' : ''}` : '';
  if (!alunos.length) { grid.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  grid.innerHTML = alunos.map(a => {
    const cor = corTurma(a.turma);
    const av  = avatarHTML(a, 88);
    const primeiroNome = a.nome.trim().split(' ')[0];
    return `<div class="caro-card" data-id="${a.id}" tabindex="0" role="button" aria-label="Ver ${a.nome}">${av}<p class="caro-card-nome">${primeiroNome}</p><span class="caro-badge" style="background:${cor}22;color:${cor}">T${a.turma}</span></div>`;
  }).join('');
  grid.querySelectorAll('.caro-card').forEach(card => {
    card.addEventListener('click', () => abrirModalAluno(Number(card.dataset.id)));
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') abrirModalAluno(Number(card.dataset.id)); });
  });
}
document.getElementById('caroTabs').addEventListener('click', e => {
  const tab = e.target.closest('.caro-tab');
  if (!tab) return;
  caroTurmaAtiva = Number(tab.dataset.turma);
  renderCarometro();
});

/* ===== Modal detalhe / edição do aluno (API) ===== */
const modalAluno = document.getElementById('modalAluno');
let maFotoAtual = null;
function abrirModalAluno(id) {
  const aluno = getAlunos().find(a => a.id === id);
  if (!aluno) return;
  const cor = corTurma(aluno.turma);
  document.getElementById('maId').value = id;
  document.getElementById('maNome').textContent = aluno.nome;
  document.getElementById('maTurmaLabel').textContent = `Turma ${aluno.turma}`;
  document.getElementById('maTurmaLabel').style.color = cor;
  maFotoAtual = aluno.foto || null;
  const maFoto = document.getElementById('maFoto');
  maFoto.style.setProperty('--turma-cor', cor);
  maFoto.innerHTML = aluno.foto ? `<img src="${aluno.foto}" alt="${aluno.nome}">` : `<span class="caro-iniciais" style="font-size:2rem">${iniciaisAluno(aluno.nome)}</span>`;
  document.getElementById('maEditNome').value  = aluno.nome;
  document.getElementById('maEditNasc').value  = aluno.nasc || '';
  document.getElementById('maEditTurma').value = aluno.turma;
  document.getElementById('maEditEmail').value = aluno.email || '';
  document.getElementById('maEditTel').value   = aluno.tel   || '';
  document.getElementById('maEditCpf').value   = formatarCpf(aluno.cpf);
  document.getElementById('msgEditAluno').className = 'form-msg';
  renderEstrelas(aluno.estrelas || 0);
  modalAluno.classList.add('show');
}
function fecharModalAluno() { modalAluno.classList.remove('show'); maFotoAtual = null; }
document.getElementById('modalAlunoClose').addEventListener('click', fecharModalAluno);
modalAluno.addEventListener('click', e => { if (e.target === modalAluno) fecharModalAluno(); });

const maFotoInput = document.getElementById('maFotoInput');
document.getElementById('maBtnFoto').addEventListener('click', () => maFotoInput.click());
maFotoInput.addEventListener('change', async () => {
  const file = maFotoInput.files[0];
  if (!file) return;
  maFotoAtual = await lerArquivoBase64(file);
  document.getElementById('maFoto').innerHTML = `<img src="${maFotoAtual}" alt="Foto">`;
  document.getElementById('maNome').textContent = document.getElementById('maEditNome').value || '';
});

document.getElementById('formEditAluno').addEventListener('submit', async () => {
  const id    = Number(document.getElementById('maId').value);
  const nome  = document.getElementById('maEditNome').value.trim();
  const nasc  = document.getElementById('maEditNasc').value;
  const turma = Number(document.getElementById('maEditTurma').value);
  const email = document.getElementById('maEditEmail').value.trim();
  const tel   = document.getElementById('maEditTel').value.trim();
  const cpf   = document.getElementById('maEditCpf').value.trim();
  const m     = document.getElementById('msgEditAluno');
  if (!nome) { msg(m, 'O nome não pode ficar em branco.', 'err'); return; }
  const estrelas = Number(document.getElementById('maEstrelasGrid').dataset.total || 0);
  try {
    await api.alunos.editar(id, { nome, nasc, turma, email, telefone: tel, cpf, foto: maFotoAtual, estrelas });
    await carregarAlunos();
    document.getElementById('maNome').textContent = nome;
    document.getElementById('maTurmaLabel').textContent = `Turma ${turma}`;
    document.getElementById('maTurmaLabel').style.color = corTurma(turma);
    msg(m, 'Alterações salvas com sucesso!', 'ok');
    setTimeout(fecharModalAluno, 1000);
  } catch (e) { msg(m, e.message, 'err'); }
});

document.getElementById('maBtnExcluir').addEventListener('click', () => {
  const id   = Number(document.getElementById('maId').value);
  const nome = document.getElementById('maEditNome').value;
  confirmar(`Excluir "${nome}"? Essa ação não pode ser desfeita.`, async () => {
    try { await api.alunos.remover(id); await carregarAlunos(); fecharModalAluno(); toast(`Aluno "${nome}" removido.`, 'ok'); }
    catch (e) { toast(e.message, 'err'); }
  });
});

/* ===== Chamada (localStorage) ===== */
const CHAMADA_KEY = 'saar_chamadas';
function getChamadas() {
  try { return JSON.parse(localStorage.getItem(CHAMADA_KEY)) || []; }
  catch(e) { return []; }
}
function salvarChamadas(lista) { localStorage.setItem(CHAMADA_KEY, JSON.stringify(lista)); }

document.getElementById('chamadaData').value = new Date().toISOString().slice(0,10);

document.getElementById('btnAbrirChamada').addEventListener('click', () => {
  const turma = Number(document.getElementById('chamadaTurma').value);
  const data  = document.getElementById('chamadaData').value;
  if (!turma) { toast('Selecione uma turma antes de continuar.', 'err'); return; }
  if (!data)  { toast('Informe a data da chamada.', 'err'); return; }
  const alunos = getAlunos().filter(a => a.turma === turma);
  if (!alunos.length) { toast(`Nenhum aluno cadastrado na Turma ${turma}. Cadastre alunos primeiro.`, 'err', 4000); return; }
  const salva = getChamadas().find(c => c.data === data && c.turma === turma);
  const freq  = salva ? salva.frequencia : {};
  const cor = CARO_CORES[(turma - 1) % CARO_CORES.length];
  const dataFmt = new Date(data + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  document.getElementById('chamadaCabecalho').innerHTML = `<div class="chamada-cabecalho-inner"><span class="chamada-turma-badge" style="background:${cor}22;color:${cor}">Turma ${turma}</span><span class="chamada-data-txt">${dataFmt}</span></div>`;
  const body = document.getElementById('chamadaBody');
  body.innerHTML = alunos.map(a => {
    const est = freq[a.id] || 'P';
    const av  = a.foto ? `<img src="${a.foto}" class="chamada-avatar" alt="">` : `<div class="chamada-avatar chamada-avatar-init" style="background:${cor}22;color:${cor}">${iniciaisAluno(a.nome)}</div>`;
    return `<tr class="chamada-row" data-id="${a.id}"><td class="chamada-nome-cell"><div class="chamada-aluno">${av}<span>${a.nome}</span></div></td><td class="chamada-freq-cell"><div class="chamada-btns"><button class="chamada-btn pres${est==='P'?' active':''}" data-val="P">P</button><button class="chamada-btn falt${est==='F'?' active':''}" data-val="F">F</button><button class="chamada-btn just${est==='J'?' active':''}" data-val="J">J</button></div></td></tr>`;
  }).join('');
  body.querySelectorAll('.chamada-row').forEach(row => {
    row.querySelectorAll('.chamada-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        row.querySelectorAll('.chamada-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        atualizarResumo();
      });
    });
  });
  atualizarResumo();
  document.getElementById('chamadaLista').style.display     = 'block';
  document.getElementById('btnSalvarChamada').style.display = 'flex';
  document.getElementById('chamadaHistorico').style.display = 'none';
});

function atualizarResumo() {
  let p = 0, f = 0, j = 0;
  document.querySelectorAll('#chamadaBody .chamada-row').forEach(row => {
    const v = row.querySelector('.chamada-btn.active')?.dataset.val || 'P';
    if (v === 'P') p++; else if (v === 'F') f++; else j++;
  });
  const total = p + f + j;
  document.getElementById('chamadaResumo').innerHTML = `<div class="chamada-resumo-inner"><span class="cr-item pres"><strong>${p}</strong> presente${p!==1?'s':''}</span><span class="cr-sep">·</span><span class="cr-item falt"><strong>${f}</strong> falta${f!==1?'s':''}</span>${j?`<span class="cr-sep">·</span><span class="cr-item just"><strong>${j}</strong> justificada${j!==1?'s':''}</span>`:''}<span class="cr-sep">·</span><span class="cr-item"><strong>${total}</strong> total</span></div>`;
}

document.getElementById('btnSalvarChamada').addEventListener('click', () => {
  const turma = Number(document.getElementById('chamadaTurma').value);
  const data  = document.getElementById('chamadaData').value;
  if (!turma || !data) return;
  const frequencia = {};
  document.querySelectorAll('#chamadaBody .chamada-row').forEach(row => {
    frequencia[Number(row.dataset.id)] = row.querySelector('.chamada-btn.active')?.dataset.val || 'P';
  });
  const vals  = Object.values(frequencia);
  const lista = getChamadas().filter(c => !(c.data === data && c.turma === turma));
  lista.unshift({ id: `${data}_${turma}`, data, turma, frequencia, presentes: vals.filter(v => v === 'P').length, faltas: vals.filter(v => v === 'F').length, justificadas: vals.filter(v => v === 'J').length });
  salvarChamadas(lista);
  const m = document.getElementById('msgChamada');
  msg(m, '✓ Chamada salva com sucesso!', 'ok');
  setTimeout(() => m.classList.remove('show'), 2500);
});

document.getElementById('btnVerHistorico').addEventListener('click', () => {
  const hist = document.getElementById('chamadaHistorico');
  const show = hist.style.display === 'none';
  hist.style.display = show ? 'block' : 'none';
  if (show) renderHistorico();
});
document.getElementById('btnFecharHistorico').addEventListener('click', () => {
  document.getElementById('chamadaHistorico').style.display = 'none';
});

function renderHistorico() {
  const lista = getChamadas();
  const body  = document.getElementById('historicoBody');
  const empty = document.getElementById('historicoEmpty');
  if (!lista.length) { body.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  body.innerHTML = lista.map(c => {
    const cor     = CARO_CORES[(c.turma - 1) % CARO_CORES.length];
    const dataFmt = new Date(c.data + 'T12:00:00').toLocaleDateString('pt-BR');
    return `<tr><td style="padding:12px 20px;font-weight:600;">${dataFmt}</td><td style="text-align:center;"><span class="caro-badge" style="background:${cor}22;color:${cor}">Turma ${c.turma}</span></td><td style="text-align:center;color:#22c55e;font-weight:700;">${c.presentes}</td><td style="text-align:center;color:#ef4444;font-weight:700;">${c.faltas}${c.justificadas?` <small style="color:#f59e0b">(+${c.justificadas}J)</small>`:''}</td><td style="text-align:center;"><button class="row-btn danger hist-del" data-id="${c.id}" title="Excluir"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg></button></td></tr>`;
  }).join('');
  body.querySelectorAll('.hist-del').forEach(btn => {
    btn.addEventListener('click', () => { salvarChamadas(getChamadas().filter(c => c.id !== btn.dataset.id)); renderHistorico(); });
  });
}

/* ===== Administradores (API) ===== */
let adminsCache = [];
function getAdmins() { return adminsCache; }
function normalizarAdmin(a) {
  return { id: a.id, nome: a.nome, nivel: a.nivel, email: a.email || '', tel: a.tel ?? a.telefone ?? '', cpf: a.cpf || '', nasc: dataCurta(a.nasc ?? a.data_nascimento), fixo: !!a.fixo };
}
async function carregarAdmins() {
  try { const lista = await api.admins.listar(); adminsCache = lista.map(normalizarAdmin); renderAdmins(document.getElementById('buscaAdm').value); }
  catch (e) { toast('Erro ao carregar administradores: ' + e.message, 'err'); }
}

const nivelInfo = { master: { label: 'ADM Master', cls: 'master' }, adm: { label: 'Administrador', cls: 'adm' }, aluno: { label: 'Aluno', cls: 'aluno' } };
function admIniciais(nome) { return nome.trim().split(/\s+/).slice(0,2).map(n => n[0]).join('').toUpperCase(); }

function renderAdmins(filtro) {
  filtro = (filtro || '').toLowerCase();
  const body  = document.getElementById('admBody');
  const empty = document.getElementById('admEmpty');
  const lista = getAdmins().filter(a => !filtro || a.nome.toLowerCase().includes(filtro) || (a.email || '').toLowerCase().includes(filtro));
  if (!lista.length) { body.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  body.innerHTML = lista.map(a => {
    const nv = nivelInfo[a.nivel] || nivelInfo.adm;
    return `<tr>
      <td style="padding:12px 14px;"><div style="display:flex;align-items:center;gap:10px;"><div class="adm-avatar adm-avatar-${nv.cls}">${admIniciais(a.nome)}</div><div><strong style="font-size:.9rem;color:var(--txt)">${a.nome}</strong>${a.fixo ? '<span class="adm-voce-tag">Você</span>' : ''}</div></div></td>
      <td style="font-size:.85rem;color:var(--dim);padding:12px 14px;">${a.email || '—'}</td>
      <td style="font-size:.85rem;color:var(--dim);padding:12px 14px;">${a.tel || '—'}</td>
      <td style="padding:12px 14px;"><span class="adm-nivel-tag ${nv.cls}">${nv.label}</span></td>
      <td style="padding:12px 14px;text-align:right;"><div class="row-actions">
        <button class="row-btn adm-editar" data-id="${a.id}" title="Editar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
        ${!a.fixo ? `<button class="row-btn danger adm-remover" data-id="${a.id}" data-nome="${a.nome}" title="Remover"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg></button>` : ''}
      </div></td>
    </tr>`;
  }).join('');
  body.querySelectorAll('.adm-editar').forEach(btn => btn.addEventListener('click', () => abrirFormAdm(Number(btn.dataset.id))));
  body.querySelectorAll('.adm-remover').forEach(btn => {
    btn.addEventListener('click', () => {
      confirmar(`Remover "${btn.dataset.nome}" dos administradores?`, async () => {
        try { await api.admins.remover(Number(btn.dataset.id)); await carregarAdmins(); toast(`Administrador "${btn.dataset.nome}" removido.`, 'ok'); }
        catch (e) { toast(e.message, 'err'); }
      });
    });
  });
}

let admModo = 'novo';
function abrirFormAdm(id) {
  document.getElementById('formAdmWrap').style.display = 'block';
  document.getElementById('btnNovoAdm').style.display  = 'none';
  document.getElementById('msgAdm').className = 'form-msg';
  if (id != null) {
    admModo = 'editar';
    const a = getAdmins().find(x => x.id === id);
    if (!a) return;
    document.getElementById('adm-id').value    = id;
    document.getElementById('adm-nome').value  = a.nome;
    document.getElementById('adm-email').value = a.email || '';
    document.getElementById('adm-tel').value   = a.tel   || '';
    document.getElementById('adm-cpf').value   = formatarCpf(a.cpf);
    document.getElementById('adm-nasc').value  = a.nasc  || '';
    document.getElementById('adm-senha').value = '';
    const r = document.querySelector(`input[name="admNivel"][value="${a.nivel}"]`);
    if (r) r.checked = true;
    document.getElementById('formAdmTitulo').textContent = 'Editar administrador';
    document.getElementById('admBtnSalvar').textContent  = 'Salvar alterações';
  } else {
    admModo = 'novo';
    document.getElementById('formAdm').reset();
    document.getElementById('adm-id').value = '';
    document.querySelector('input[name="admNivel"][value="adm"]').checked = true;
    document.getElementById('formAdmTitulo').textContent = 'Novo administrador';
    document.getElementById('admBtnSalvar').textContent  = 'Cadastrar';
  }
}
function fecharFormAdm() {
  document.getElementById('formAdmWrap').style.display = 'none';
  document.getElementById('btnNovoAdm').style.display  = 'flex';
  document.getElementById('formAdm').reset();
}
document.getElementById('btnNovoAdm').addEventListener('click', () => abrirFormAdm(null));
document.getElementById('btnCancelarAdm').addEventListener('click', fecharFormAdm);

document.getElementById('adm-cpf').addEventListener('input', function() {
  let v = this.value.replace(/\D/g, '').slice(0,11);
  v = v.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  this.value = v;
});
document.getElementById('adm-tel').addEventListener('input', function() {
  let v = this.value.replace(/\D/g, '').slice(0,11);
  if (v.length > 10)     v = v.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
  else if (v.length > 6) v = v.replace(/^(\d{2})(\d{4})(\d*)/, '($1) $2-$3');
  else if (v.length > 2) v = v.replace(/^(\d{2})(\d*)/, '($1) $2');
  this.value = v;
});

document.getElementById('formAdm').addEventListener('submit', async () => {
  const nome  = document.getElementById('adm-nome').value.trim();
  const email = document.getElementById('adm-email').value.trim();
  const tel   = document.getElementById('adm-tel').value.trim();
  const cpf   = document.getElementById('adm-cpf').value.trim();
  const nasc  = document.getElementById('adm-nasc').value;
  const senha = document.getElementById('adm-senha').value;
  const nivel = document.querySelector('input[name="admNivel"]:checked')?.value || 'adm';
  const m     = document.getElementById('msgAdm');
  if (!nome) { msg(m, 'O nome completo é obrigatório.', 'err'); return; }
  if (!cpf)  { msg(m, 'O CPF é obrigatório (será o login).', 'err'); return; }
  const corpo = { nome, email, telefone: tel, cpf, data_nascimento: nasc || null, nivel };
  if (senha) corpo.senha = senha;
  try {
    if (admModo === 'editar') {
      const id = Number(document.getElementById('adm-id').value);
      await api.admins.editar(id, corpo);
      msg(m, 'Administrador atualizado com sucesso!', 'ok');
    } else {
      if (!senha) { msg(m, 'Defina uma senha de acesso para o novo administrador.', 'err'); return; }
      await api.admins.criar(corpo);
      msg(m, `"${nome}" cadastrado como ${nivelInfo[nivel].label}.`, 'ok');
    }
    await carregarAdmins();
    setTimeout(fecharFormAdm, 1100);
  } catch (e) { msg(m, e.message, 'err'); }
});

document.getElementById('buscaAdm').addEventListener('input', e => renderAdmins(e.target.value));

/* ===== Carregamento inicial (busca do banco) ===== */
carregarAlunos();
carregarAdmins();
