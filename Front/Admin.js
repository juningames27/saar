/* ===== Utilitários de UI ===== */

// Mensagem inline (form)
function msg(el, text, type) {
  el.textContent = text;
  el.className = 'form-msg show ' + type;
}

// Toast flutuante (substitui alert)
function toast(text, type = 'info', duration = 3000) {
  const wrap = document.getElementById('toastWrap');
  const el   = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<span>${text}</span><button class="toast-close" aria-label="Fechar">✕</button>`;
  el.querySelector('.toast-close').addEventListener('click', () => el.remove());
  wrap.appendChild(el);
  // Anima entrada
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 300); }, duration);
}

// Confirmação inline (substitui confirm)
function confirmar(texto, onOk) {
  document.getElementById('confirmMsg').textContent = texto;
  const modal  = document.getElementById('modalConfirm');
  const btnOk  = document.getElementById('confirmOk');
  const btnCan = document.getElementById('confirmCancel');
  modal.classList.add('show');
  const fechar = () => modal.classList.remove('show');
  const handleOk = () => { fechar(); btnOk.removeEventListener('click', handleOk); btnCan.removeEventListener('click', fechar); onOk(); };
  btnOk.addEventListener('click', handleOk);
  btnCan.addEventListener('click', fechar);
  modal.addEventListener('click', e => { if (e.target === modal) fechar(); }, { once: true });
}

/* ===== Troca de painéis (menu lateral) ===== */
const navItems = document.querySelectorAll('.side-item[data-panel]');
const panels   = document.querySelectorAll('.panel');

function openPanel(id) {
  panels.forEach(p => p.classList.toggle('active', p.id === id));
  navItems.forEach(b => b.classList.toggle('active', b.dataset.panel === id));
  closeMenu();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  // Atualiza carômetro ao abrir
  if (id === 'carometro') renderCarometro();
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
  materiais:         { sub: 'subEnsino',  pai: 'btnEnsino'  },
  horario:           { sub: 'subEnsino',  pai: 'btnEnsino'  },
  'cadastrar-aluno': { sub: 'subAlunos',  pai: 'btnAlunos'  },
  carometro:         { sub: 'subAlunos',  pai: 'btnAlunos'  },
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

/* ===== Foto de perfil ===== */
const avatarInput = document.getElementById('avatarInput');

document.getElementById('avatarEdit').addEventListener('click', () => avatarInput.click());

avatarInput.addEventListener('change', () => {
  const file = avatarInput.files[0];
  if (!file) return;
  document.getElementById('avatar').innerHTML =
    '<img src="' + URL.createObjectURL(file) + '" alt="Foto de perfil">';
});

/* ===== Salvar perfil ===== */
document.getElementById('formPerfil').addEventListener('submit', () => {
  const nome = document.getElementById('pf-nome').value.trim();
  if (nome) {
    document.getElementById('profName').textContent = nome;
    document.getElementById('topName').textContent  = nome.split(' ')[0];
  }
  msg(document.getElementById('msgPerfil'),
    'Perfil pronto para envio. Conecte ao backend para salvar.', 'info');
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

/* ===== Validação de senha ===== */
document.getElementById('formSenha').addEventListener('submit', () => {
  const nova = document.getElementById('pw-nova').value;
  const conf = document.getElementById('pw-conf').value;
  const m    = document.getElementById('msgSenha');
  if (nova.length < 6) { msg(m, 'A senha deve ter pelo menos 6 caracteres.', 'err'); return; }
  if (nova !== conf)   { msg(m, 'As senhas não coincidem.', 'err'); return; }
  msg(m, 'Senha validada. Conecte ao backend para salvar a alteração.', 'ok');
});

/* ===== Materiais ===== */
const materiais = [
  { id: 1, nome: 'Apostila de Português — 2º Ano',      turma: '2º Ano A — Português',   tipo: 'Apostila',  data: '28/05/2026', arquivo: 'apostila_port.pdf' },
  { id: 2, nome: 'Lista de Exercícios — Matemática',    turma: '3º Ano B — Matemática',   tipo: 'Exercício', data: '30/05/2026', arquivo: 'lista_mat.pdf'     },
];

function renderMateriais(filtro = '') {
  const body  = document.getElementById('matBody');
  const empty = document.getElementById('matEmpty');

  const lista = filtro
    ? materiais.filter(m =>
        m.nome.toLowerCase().includes(filtro.toLowerCase()) ||
        m.turma.toLowerCase().includes(filtro.toLowerCase()))
    : materiais;

  body.innerHTML = lista.map(m => `
    <tr>
      <td>
        <div class="mat-nome">
          <div class="mat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <span>${m.nome}</span>
        </div>
      </td>
      <td>${m.turma}</td>
      <td><span class="badge">${m.tipo}</span></td>
      <td>${m.data}</td>
      <td>
        <div class="row-actions">
          <button class="row-btn" title="Baixar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>
          <button class="row-btn danger" title="Excluir" data-id="${m.id}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  empty.style.display = lista.length ? 'none' : 'block';

  body.querySelectorAll('.row-btn.danger').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = materiais.findIndex(m => m.id === Number(btn.dataset.id));
      if (idx > -1) { materiais.splice(idx, 1); renderMateriais(); }
    });
  });
}

renderMateriais();

document.getElementById('buscaMaterial').addEventListener('input', e => renderMateriais(e.target.value));

document.getElementById('btnNovoMaterial').addEventListener('click', () => {
  document.getElementById('formMaterialWrap').style.display = 'block';
  document.getElementById('btnNovoMaterial').style.display  = 'none';
});

document.getElementById('btnCancelarMaterial').addEventListener('click', () => {
  document.getElementById('formMaterialWrap').style.display = 'none';
  document.getElementById('btnNovoMaterial').style.display  = 'flex';
  document.getElementById('formMaterial').reset();
  document.getElementById('fileLabel').innerHTML = 'Arraste um arquivo ou <span>clique para selecionar</span>';
});

/* Upload de arquivo */
const fileDrop  = document.getElementById('fileDrop');
const fileInput = document.getElementById('mat-arquivo');

fileDrop.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => {
  if (fileInput.files[0])
    document.getElementById('fileLabel').innerHTML = '<strong>' + fileInput.files[0].name + '</strong>';
});
fileDrop.addEventListener('dragover',  e => { e.preventDefault(); fileDrop.classList.add('drag'); });
fileDrop.addEventListener('dragleave', () => fileDrop.classList.remove('drag'));
fileDrop.addEventListener('drop', e => {
  e.preventDefault(); fileDrop.classList.remove('drag');
  if (e.dataTransfer.files[0]) {
    fileInput.files = e.dataTransfer.files;
    document.getElementById('fileLabel').innerHTML = '<strong>' + e.dataTransfer.files[0].name + '</strong>';
  }
});

document.getElementById('formMaterial').addEventListener('submit', () => {
  const nome  = document.getElementById('mat-nome').value.trim();
  const turma = document.getElementById('mat-turma').value.trim();
  const tipo  = document.getElementById('mat-tipo').value;
  const m     = document.getElementById('msgMaterial');

  if (!nome || !turma || !tipo) {
    msg(m, 'Preencha nome, turma e tipo antes de enviar.', 'err');
    return;
  }

  materiais.unshift({
    id: Date.now(), nome, turma, tipo,
    data: new Date().toLocaleDateString('pt-BR'),
    arquivo: fileInput.files[0]?.name || '—',
  });

  renderMateriais();
  msg(m, 'Material adicionado com sucesso!', 'ok');
  setTimeout(() => document.getElementById('btnCancelarMaterial').click(), 1200);
});

/* ===== Horário (grade editável) ===== */
const HOR_KEY = 'saar_horario';

const horarioPadrao = [
  // Manhã — 4 períodos (08:00 às 11:00)
  { turno: 'Manhã', periodo: '1º', horario: '08:00 - 08:45', seg: 'Turma 1', ter: 'Turma 1', qua: 'Turma 3', qui: 'Turma 3', sex: 'Turma 5' },
  { turno: '',      periodo: '2º', horario: '08:45 - 09:30', seg: 'Turma 1', ter: 'Turma 1', qua: 'Turma 3', qui: 'Turma 3', sex: 'Turma 5' },
  { turno: '',      periodo: '3º', horario: '09:30 - 10:15', seg: 'Turma 1', ter: 'Turma 1', qua: 'Turma 3', qui: 'Turma 3', sex: 'Turma 5' },
  { turno: '',      periodo: '4º', horario: '10:15 - 11:00', seg: 'Turma 1', ter: 'Turma 1', qua: 'Turma 3', qui: 'Turma 3', sex: 'Turma 5' },
  // Tarde — 4 períodos (14:00 às 17:00)
  { turno: 'Tarde', periodo: '1º', horario: '14:00 - 14:45', seg: 'Turma 2', ter: 'Turma 2', qua: 'Turma 4', qui: 'Turma 4', sex: 'Turma 6' },
  { turno: '',      periodo: '2º', horario: '14:45 - 15:30', seg: 'Turma 2', ter: 'Turma 2', qua: 'Turma 4', qui: 'Turma 4', sex: 'Turma 6' },
  { turno: '',      periodo: '3º', horario: '15:30 - 16:15', seg: 'Turma 2', ter: 'Turma 2', qua: 'Turma 4', qui: 'Turma 4', sex: 'Turma 6' },
  { turno: '',      periodo: '4º', horario: '16:15 - 17:00', seg: 'Turma 2', ter: 'Turma 2', qua: 'Turma 4', qui: 'Turma 4', sex: 'Turma 6' },
];

const turmaCores = {
  'Turma 1': '#1d4ed8',
  'Turma 2': '#0f766e',
  'Turma 3': '#7c3aed',
  'Turma 4': '#b45309',
  'Turma 5': '#be123c',
  'Turma 6': '#065f46',
};

function horChave() {
  const mes = document.getElementById('horMes').value;
  return `${HOR_KEY}_${new Date().getFullYear()}_${mes}`;
}

function clonarHorarioPadrao() {
  return JSON.parse(JSON.stringify(horarioPadrao));
}

function getHorarioData() {
  try {
    return JSON.parse(localStorage.getItem(horChave())) || clonarHorarioPadrao();
  } catch (e) {
    return clonarHorarioPadrao();
  }
}

function aplicarCorCelula(cell, valor) {
  const cor = turmaCores[valor.trim()];

  if (cor) {
    cell.classList.add('has-color');
    cell.style.setProperty('--cell-color', cor);
  } else {
    cell.classList.remove('has-color');
    cell.style.removeProperty('--cell-color');
  }
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
    cell.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        cell.blur();
      }
    });
  });
}

function coletarHorario() {
  const dados = getHorarioData();

  document.querySelectorAll('#horBody [contenteditable][data-row]').forEach(cell => {
    const row = Number(cell.dataset.row);
    const col = cell.dataset.col;

    if (dados[row] && col) {
      dados[row][col] = cell.textContent.trim();
    }
  });

  return dados;
}

function salvarHorarioAutomatico() {
  localStorage.setItem(horChave(), JSON.stringify(coletarHorario()));
}

document.getElementById('btnSalvarHorario').addEventListener('click', () => {
  salvarHorarioAutomatico();

  const m = document.getElementById('msgHorario');
  msg(m, '✓ Horário salvo com sucesso!', 'ok');

  setTimeout(() => {
    m.classList.remove('show');
  }, 2500);
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

// Limpa cache com formato antigo (campo "semana")
(function() {
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const k = localStorage.key(i);
    if (k && k.startsWith(HOR_KEY)) {
      try {
        const d = JSON.parse(localStorage.getItem(k));
        if (Array.isArray(d) && d[0] && ('semana' in d[0] || d.length !== 8)) localStorage.removeItem(k);
      } catch(e) { localStorage.removeItem(k); }
    }
  }
})();

renderHorario();

/* ===== Alunos ===== */
const TURMAS = ['Turma 1','Turma 2','Turma 3','Turma 4','Turma 5','Turma 6'];
const ALUNOS_KEY = 'saar_alunos';

function getAlunos() {
  try { return JSON.parse(localStorage.getItem(ALUNOS_KEY)) || []; }
  catch(e) { return []; }
}
function salvarAlunos(lista) { localStorage.setItem(ALUNOS_KEY, JSON.stringify(lista)); }

// Máscara CPF
document.getElementById('al-cpf').addEventListener('input', function() {
  let v = this.value.replace(/\D/g,'').slice(0,11);
  v = v.replace(/(\d{3})(\d)/,'$1.$2');
  v = v.replace(/(\d{3})(\d)/,'$1.$2');
  v = v.replace(/(\d{3})(\d{1,2})$/,'$1-$2');
  this.value = v;
});

// Máscara telefone
document.getElementById('al-tel').addEventListener('input', function() {
  let v = this.value.replace(/\D/g,'').slice(0,11);
  if (v.length > 10) v = v.replace(/^(\d{2})(\d{5})(\d{4}).*/,'($1) $2-$3');
  else if (v.length > 6) v = v.replace(/^(\d{2})(\d{4})(\d*)/,'($1) $2-$3');
  else if (v.length > 2) v = v.replace(/^(\d{2})(\d*)/,'($1) $2');
  this.value = v;
});

// Preview da foto
const alunoFotoInput = document.getElementById('alunoFotoInput');
document.getElementById('btnFotoAluno').addEventListener('click', () => alunoFotoInput.click());
alunoFotoInput.addEventListener('change', () => {
  const file = alunoFotoInput.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  document.getElementById('alunoFotoPreview').innerHTML = `<img src="${url}" alt="Foto">`;
});

// Cadastro
document.getElementById('formAluno').addEventListener('submit', () => {
  const nome  = document.getElementById('al-nome').value.trim();
  const nasc  = document.getElementById('al-nasc').value;
  const email = document.getElementById('al-email').value.trim();
  const tel   = document.getElementById('al-tel').value.trim();
  const cpf   = document.getElementById('al-cpf').value.trim();
  const turma = document.getElementById('al-turma').value;
  const m     = document.getElementById('msgAluno');

  if (!nome || !turma || !nasc) { msg(m, 'Preencha ao menos nome, data de nascimento e turma.', 'err'); return; }

  const foto = document.getElementById('alunoFotoPreview').querySelector('img')?.src || null;

  const alunos = getAlunos();
  alunos.push({ id: Date.now(), nome, nasc, email, tel, cpf, turma: Number(turma), foto });
  salvarAlunos(alunos);

  msg(m, `Aluno "${nome}" cadastrado com sucesso na Turma ${turma}!`, 'ok');
  document.getElementById('formAluno').reset();
  document.getElementById('alunoFotoPreview').innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
  renderCarometro();
});

// Limpar reseta foto também
document.querySelector('#formAluno button[type="reset"]').addEventListener('click', () => {
  setTimeout(() => {
    document.getElementById('alunoFotoPreview').innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
  }, 0);
});

/* ===== Estrelas ===== */
const TOTAL_ESTRELAS = 40; // 4 linhas × 10

function renderEstrelas(marcadas) {
  const grid  = document.getElementById('maEstrelasGrid');
  const count = document.getElementById('maEstrelasCount');
  grid.dataset.total = marcadas;
  grid.innerHTML = '';

  for (let i = 1; i <= TOTAL_ESTRELAS; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'estrela-btn' + (i <= marcadas ? ' on' : '');
    btn.dataset.i  = i;
    btn.innerHTML  = '★';
    btn.setAttribute('aria-label', `Estrela ${i}`);
    btn.addEventListener('click', () => {
      const atual = Number(grid.dataset.total);
      // Clicar na mesma que já é a última → desativa todas; senão define até i
      const novo  = (i === atual) ? 0 : i;
      renderEstrelas(novo);
    });
    grid.appendChild(btn);
  }
  atualizarContadorEstrelas(marcadas);
}

function atualizarContadorEstrelas(n) {
  const el    = document.getElementById('maEstrelasCount');
  const nomes = ['zero','uma','duas','três','quatro','cinco','seis','sete','oito','nove','dez',
                 'onze','doze','treze','quatorze','quinze','dezesseis','dezessete','dezoito','dezenove','vinte',
                 'vinte e uma','vinte e duas','vinte e três','vinte e quatro','vinte e cinco',
                 'vinte e seis','vinte e sete','vinte e oito','vinte e nove','trinta',
                 'trinta e uma','trinta e duas','trinta e três','trinta e quatro','trinta e cinco',
                 'trinta e seis','trinta e sete','trinta e oito','trinta e nove','quarenta'];
  const label = n <= 40 ? nomes[n] : n;
  el.textContent = `${n} (${label}) estrela${n !== 1 ? 's' : ''}`;
  el.style.color = n === 0 ? 'var(--label)' : '#f59e0b';
}

/* ===== Carômetro ===== */
const CARO_CORES = ['#1d4ed8','#0f766e','#7c3aed','#b45309','#be123c','#065f46'];
let caroTurmaAtiva = 0; // 0 = todas

function corTurma(t) { return CARO_CORES[(t - 1) % CARO_CORES.length]; }

function iniciaisAluno(nome) {
  return nome.trim().split(/\s+/).slice(0,2).map(n => n[0]).join('').toUpperCase();
}

function avatarHTML(aluno, size = 80) {
  const cor = corTurma(aluno.turma);
  if (aluno.foto) {
    return `<div class="caro-avatar" style="width:${size}px;height:${size}px;--turma-cor:${cor}"><img src="${aluno.foto}" alt="${aluno.nome}"></div>`;
  }
  return `<div class="caro-avatar" style="width:${size}px;height:${size}px;--turma-cor:${cor};font-size:${Math.round(size*0.3)}px"><span class="caro-iniciais">${iniciaisAluno(aluno.nome)}</span></div>`;
}

function renderCarometro() {
  const grid  = document.getElementById('caroGrid');
  const empty = document.getElementById('caroEmpty');
  const count = document.getElementById('caroCount');

  // Atualiza tabs
  document.querySelectorAll('.caro-tab').forEach(t => {
    t.classList.toggle('active', Number(t.dataset.turma) === caroTurmaAtiva);
  });

  const todos  = getAlunos();
  const alunos = caroTurmaAtiva === 0 ? todos : todos.filter(a => a.turma === caroTurmaAtiva);

  count.textContent = alunos.length ? `${alunos.length} aluno${alunos.length > 1 ? 's' : ''}` : '';

  if (!alunos.length) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  grid.innerHTML = alunos.map(a => {
    const cor = corTurma(a.turma);
    const av  = avatarHTML(a, 88);
    const primeiroNome = a.nome.trim().split(' ')[0];
    return `<div class="caro-card" data-id="${a.id}" tabindex="0" role="button" aria-label="Ver ${a.nome}">
      ${av}
      <p class="caro-card-nome">${primeiroNome}</p>
      <span class="caro-badge" style="background:${cor}22;color:${cor}">T${a.turma}</span>
    </div>`;
  }).join('');

  grid.querySelectorAll('.caro-card').forEach(card => {
    card.addEventListener('click', () => abrirModalAluno(Number(card.dataset.id)));
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') abrirModalAluno(Number(card.dataset.id)); });
  });
}

// Tabs
document.getElementById('caroTabs').addEventListener('click', e => {
  const tab = e.target.closest('.caro-tab');
  if (!tab) return;
  caroTurmaAtiva = Number(tab.dataset.turma);
  renderCarometro();
});

/* ===== Modal detalhe / edição do aluno ===== */
const modalAluno = document.getElementById('modalAluno');
let maFotoAtual  = null; // URL da foto em edição

function abrirModalAluno(id) {
  const aluno = getAlunos().find(a => a.id === id);
  if (!aluno) return;
  const cor = corTurma(aluno.turma);

  document.getElementById('maId').value          = id;
  document.getElementById('maNome').textContent  = aluno.nome;
  document.getElementById('maTurmaLabel').textContent = `Turma ${aluno.turma}`;
  document.getElementById('maTurmaLabel').style.color = cor;

  // Foto no modal
  maFotoAtual = aluno.foto || null;
  const maFoto = document.getElementById('maFoto');
  maFoto.style.setProperty('--turma-cor', cor);
  maFoto.innerHTML = aluno.foto
    ? `<img src="${aluno.foto}" alt="${aluno.nome}">`
    : `<span class="caro-iniciais" style="font-size:2rem">${iniciaisAluno(aluno.nome)}</span>`;

  // Preenche form de edição
  document.getElementById('maEditNome').value  = aluno.nome;
  document.getElementById('maEditNasc').value  = aluno.nasc || '';
  document.getElementById('maEditTurma').value = aluno.turma;
  document.getElementById('maEditEmail').value = aluno.email || '';
  document.getElementById('maEditTel').value   = aluno.tel   || '';
  document.getElementById('maEditCpf').value   = aluno.cpf   || '';
  document.getElementById('msgEditAluno').className = 'form-msg';

  // Estrelas
  renderEstrelas(aluno.estrelas || 0);

  modalAluno.classList.add('show');
}

function fecharModalAluno() { modalAluno.classList.remove('show'); maFotoAtual = null; }

document.getElementById('modalAlunoClose').addEventListener('click', fecharModalAluno);
modalAluno.addEventListener('click', e => { if (e.target === modalAluno) fecharModalAluno(); });

// Alterar foto dentro do modal
const maFotoInput = document.getElementById('maFotoInput');
document.getElementById('maBtnFoto').addEventListener('click', () => maFotoInput.click());
maFotoInput.addEventListener('change', () => {
  const file = maFotoInput.files[0];
  if (!file) return;
  maFotoAtual = URL.createObjectURL(file);
  document.getElementById('maFoto').innerHTML = `<img src="${maFotoAtual}" alt="Foto">`;
  document.getElementById('maNome').textContent = document.getElementById('maEditNome').value || '';
});

// Salvar edição
document.getElementById('formEditAluno').addEventListener('submit', () => {
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

  const lista = getAlunos().map(a =>
    a.id === id ? { ...a, nome, nasc, turma, email, tel, cpf, foto: maFotoAtual, estrelas } : a
  );
  salvarAlunos(lista);
  renderCarometro();

  document.getElementById('maNome').textContent = nome;
  document.getElementById('maTurmaLabel').textContent = `Turma ${turma}`;
  document.getElementById('maTurmaLabel').style.color = corTurma(turma);
  msg(m, 'Alterações salvas com sucesso!', 'ok');
  setTimeout(fecharModalAluno, 1000);
});

// Excluir aluno
document.getElementById('maBtnExcluir').addEventListener('click', () => {
  const id   = Number(document.getElementById('maId').value);
  const nome = document.getElementById('maEditNome').value;
  confirmar(`Excluir "${nome}"? Essa ação não pode ser desfeita.`, () => {
    salvarAlunos(getAlunos().filter(a => a.id !== id));
    renderCarometro();
    fecharModalAluno();
    toast(`Aluno "${nome}" removido.`, 'ok');
  });
});

renderCarometro();

/* ===== Chamada ===== */
const CHAMADA_KEY = 'saar_chamadas';

subMenuMap['chamada'] = { sub: 'subEnsino', pai: 'btnEnsino' };

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
  if (!alunos.length) {
    toast(`Nenhum aluno cadastrado na Turma ${turma}. Cadastre alunos primeiro.`, 'err', 4000);
    return;
  }

  const salva = getChamadas().find(c => c.data === data && c.turma === turma);
  const freq  = salva ? salva.frequencia : {};

  const cor = CARO_CORES[(turma - 1) % CARO_CORES.length];
  const dataFmt = new Date(data + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
  });

  document.getElementById('chamadaCabecalho').innerHTML = `
    <div class="chamada-cabecalho-inner">
      <span class="chamada-turma-badge" style="background:${cor}22;color:${cor}">Turma ${turma}</span>
      <span class="chamada-data-txt">${dataFmt}</span>
    </div>`;

  const body = document.getElementById('chamadaBody');
  body.innerHTML = alunos.map(a => {
    const est = freq[a.id] || 'P';
    const av  = a.foto
      ? `<img src="${a.foto}" class="chamada-avatar" alt="">`
      : `<div class="chamada-avatar chamada-avatar-init" style="background:${cor}22;color:${cor}">${iniciaisAluno(a.nome)}</div>`;
    return `<tr class="chamada-row" data-id="${a.id}">
      <td class="chamada-nome-cell">
        <div class="chamada-aluno">${av}<span>${a.nome}</span></div>
      </td>
      <td class="chamada-freq-cell">
        <div class="chamada-btns">
          <button class="chamada-btn pres${est==='P'?' active':''}" data-val="P">P</button>
          <button class="chamada-btn falt${est==='F'?' active':''}" data-val="F">F</button>
          <button class="chamada-btn just${est==='J'?' active':''}" data-val="J">J</button>
        </div>
      </td>
    </tr>`;
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
  document.getElementById('chamadaResumo').innerHTML = `
    <div class="chamada-resumo-inner">
      <span class="cr-item pres"><strong>${p}</strong> presente${p!==1?'s':''}</span>
      <span class="cr-sep">·</span>
      <span class="cr-item falt"><strong>${f}</strong> falta${f!==1?'s':''}</span>
      ${j?`<span class="cr-sep">·</span><span class="cr-item just"><strong>${j}</strong> justificada${j!==1?'s':''}</span>`:''}
      <span class="cr-sep">·</span>
      <span class="cr-item"><strong>${total}</strong> total</span>
    </div>`;
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
  lista.unshift({
    id: `${data}_${turma}`, data, turma, frequencia,
    presentes:    vals.filter(v => v === 'P').length,
    faltas:       vals.filter(v => v === 'F').length,
    justificadas: vals.filter(v => v === 'J').length,
  });
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
    return `<tr>
      <td style="padding:12px 20px;font-weight:600;">${dataFmt}</td>
      <td style="text-align:center;"><span class="caro-badge" style="background:${cor}22;color:${cor}">Turma ${c.turma}</span></td>
      <td style="text-align:center;color:#22c55e;font-weight:700;">${c.presentes}</td>
      <td style="text-align:center;color:#ef4444;font-weight:700;">${c.faltas}${c.justificadas?` <small style="color:#f59e0b">(+${c.justificadas}J)</small>`:''}</td>
      <td style="text-align:center;">
        <button class="row-btn danger hist-del" data-id="${c.id}" title="Excluir">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
        </button>
      </td>
    </tr>`;
  }).join('');

  body.querySelectorAll('.hist-del').forEach(btn => {
    btn.addEventListener('click', () => {
      salvarChamadas(getChamadas().filter(c => c.id !== btn.dataset.id));
      renderHistorico();
    });
  });
}

/* ===== Administradores ===== */
const ADM_KEY = 'saar_admins';

(function initAdmins() {
  if (!localStorage.getItem(ADM_KEY)) {
    const nomeAtual = document.getElementById('profName')?.textContent || 'Wendel';
    localStorage.setItem(ADM_KEY, JSON.stringify([{
      id: 1, nome: nomeAtual, email: '', tel: '', cpf: '', nasc: '',
      nivel: 'master', fixo: true
    }]));
  }
})();

function getAdmins() {
  try { return JSON.parse(localStorage.getItem(ADM_KEY)) || []; }
  catch(e) { return []; }
}
function salvarAdmins(lista) { localStorage.setItem(ADM_KEY, JSON.stringify(lista)); }

const nivelInfo = {
  master: { label: 'ADM Master',     cls: 'master' },
  adm:    { label: 'Administrador',  cls: 'adm'    },
  aluno:  { label: 'Aluno',          cls: 'aluno'  },
};

function admIniciais(nome) {
  return nome.trim().split(/\s+/).slice(0,2).map(n => n[0]).join('').toUpperCase();
}

function renderAdmins(filtro) {
  filtro = (filtro || '').toLowerCase();
  const body  = document.getElementById('admBody');
  const empty = document.getElementById('admEmpty');
  const lista = getAdmins().filter(a =>
    !filtro ||
    a.nome.toLowerCase().includes(filtro) ||
    (a.email || '').toLowerCase().includes(filtro)
  );

  if (!lista.length) { body.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';

  body.innerHTML = lista.map(a => {
    const nv = nivelInfo[a.nivel] || nivelInfo.adm;
    return `<tr>
      <td style="padding:12px 14px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div class="adm-avatar adm-avatar-${nv.cls}">${admIniciais(a.nome)}</div>
          <div>
            <strong style="font-size:.9rem;color:var(--txt)">${a.nome}</strong>
            ${a.fixo ? '<span class="adm-voce-tag">Você</span>' : ''}
          </div>
        </div>
      </td>
      <td style="font-size:.85rem;color:var(--dim);padding:12px 14px;">${a.email || '—'}</td>
      <td style="font-size:.85rem;color:var(--dim);padding:12px 14px;">${a.tel   || '—'}</td>
      <td style="padding:12px 14px;"><span class="adm-nivel-tag ${nv.cls}">${nv.label}</span></td>
      <td style="padding:12px 14px;text-align:right;">
        <div class="row-actions">
          <button class="row-btn adm-editar" data-id="${a.id}" title="Editar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          ${!a.fixo ? `<button class="row-btn danger adm-remover" data-id="${a.id}" data-nome="${a.nome}" title="Remover">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
          </button>` : ''}
        </div>
      </td>
    </tr>`;
  }).join('');

  body.querySelectorAll('.adm-editar').forEach(btn => {
    btn.addEventListener('click', () => abrirFormAdm(Number(btn.dataset.id)));
  });
  body.querySelectorAll('.adm-remover').forEach(btn => {
    btn.addEventListener('click', () => {
      confirmar(`Remover "${btn.dataset.nome}" dos administradores?`, () => {
        salvarAdmins(getAdmins().filter(a => a.id !== Number(btn.dataset.id)));
        renderAdmins(document.getElementById('buscaAdm').value);
        toast(`Administrador "${btn.dataset.nome}" removido.`, 'ok');
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
    document.getElementById('adm-cpf').value   = a.cpf   || '';
    document.getElementById('adm-nasc').value  = a.nasc  || '';
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

document.getElementById('formAdm').addEventListener('submit', () => {
  const nome  = document.getElementById('adm-nome').value.trim();
  const email = document.getElementById('adm-email').value.trim();
  const tel   = document.getElementById('adm-tel').value.trim();
  const cpf   = document.getElementById('adm-cpf').value.trim();
  const nasc  = document.getElementById('adm-nasc').value;
  const nivel = document.querySelector('input[name="admNivel"]:checked')?.value || 'adm';
  const m     = document.getElementById('msgAdm');

  if (!nome) { msg(m, 'O nome completo é obrigatório.', 'err'); return; }

  const lista = getAdmins();

  if (admModo === 'editar') {
    const id  = Number(document.getElementById('adm-id').value);
    const idx = lista.findIndex(a => a.id === id);
    if (idx > -1) Object.assign(lista[idx], { nome, email, tel, cpf, nasc, nivel });
    salvarAdmins(lista);
    renderAdmins(document.getElementById('buscaAdm').value);
    msg(m, 'Administrador atualizado com sucesso!', 'ok');
    setTimeout(fecharFormAdm, 1000);
  } else {
    lista.push({ id: Date.now(), nome, email, tel, cpf, nasc, nivel, fixo: false });
    salvarAdmins(lista);
    renderAdmins(document.getElementById('buscaAdm').value);
    msg(m, `"${nome}" cadastrado como ${nivelInfo[nivel].label}.`, 'ok');
    setTimeout(fecharFormAdm, 1200);
  }
});

document.getElementById('buscaAdm').addEventListener('input', e => renderAdmins(e.target.value));
renderAdmins();