// ===== Rotas de usuários (admins + alunos) =====
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool, soDigitos } from '../db.js';
import { autenticar, exigirNivel } from '../auth.js';

const router = Router();
const SALT = 10;

// Monta a senha padrão de aluno = data de nascimento em DDMMAAAA
function senhaPadraoAluno(dataNasc) {
  if (!dataNasc) return null;
  const d = new Date(dataNasc + 'T12:00:00');
  if (isNaN(d)) return null;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const aa = d.getFullYear();
  return `${dd}${mm}${aa}`;
}

// Remove o hash da senha antes de devolver pro front
function semSenha(u) {
  const { senha_hash, ...resto } = u;
  return resto;
}

/* ===================== ADMINISTRADORES ===================== */

// Lista admins (master e adm). Só master/adm acessam.
router.get('/admins', autenticar, exigirNivel('master', 'adm'), async (req, res) => {
  const r = await pool.query(
    `SELECT id, cpf, nome, nivel, email, telefone, data_nascimento, fixo
       FROM usuarios WHERE nivel IN ('master','adm') ORDER BY fixo DESC, nome`
  );
  res.json(r.rows);
});

// Cria admin (master ou adm). Só o MASTER pode.
router.post('/admins', autenticar, exigirNivel('master'), async (req, res) => {
  try {
    const { nome, email, telefone, data_nascimento } = req.body;
    const cpf = soDigitos(req.body.cpf);
    const nivel = req.body.nivel === 'master' ? 'master' : 'adm';
    const senha = req.body.senha;

    if (!nome || !cpf) return res.status(400).json({ erro: 'Nome e CPF são obrigatórios.' });
    if (!senha) return res.status(400).json({ erro: 'Defina uma senha para o administrador.' });

    const hash = await bcrypt.hash(senha, SALT);
    const r = await pool.query(
      `INSERT INTO usuarios (cpf, senha_hash, nome, nivel, email, telefone, data_nascimento)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING id, cpf, nome, nivel, email, telefone, data_nascimento, fixo`,
      [cpf, hash, nome, nivel, email || null, telefone || null, data_nascimento || null]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ erro: 'Já existe um usuário com esse CPF.' });
    console.error(e);
    res.status(500).json({ erro: 'Erro ao criar administrador.' });
  }
});

// Atualiza admin. Só o MASTER.
router.put('/admins/:id', autenticar, exigirNivel('master'), async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, telefone, data_nascimento } = req.body;
    const cpf = soDigitos(req.body.cpf);
    const nivel = req.body.nivel === 'master' ? 'master' : 'adm';

    const campos = [nome, cpf, nivel, email || null, telefone || null, data_nascimento || null, id];
    let sql = `UPDATE usuarios SET nome=$1, cpf=$2, nivel=$3, email=$4, telefone=$5, data_nascimento=$6`;

    // troca a senha só se enviada
    if (req.body.senha) {
      const hash = await bcrypt.hash(req.body.senha, SALT);
      sql += `, senha_hash=$8`;
      campos.push(hash);
    }
    sql += ` WHERE id=$7 RETURNING id, cpf, nome, nivel, email, telefone, data_nascimento, fixo`;

    const r = await pool.query(sql, campos);
    if (r.rowCount === 0) return res.status(404).json({ erro: 'Administrador não encontrado.' });
    res.json(r.rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ erro: 'CPF já cadastrado.' });
    console.error(e);
    res.status(500).json({ erro: 'Erro ao atualizar.' });
  }
});

// Remove admin. Só o MASTER. Não permite remover um registro fixo.
router.delete('/admins/:id', autenticar, exigirNivel('master'), async (req, res) => {
  const r = await pool.query('DELETE FROM usuarios WHERE id=$1 AND fixo=FALSE RETURNING id', [req.params.id]);
  if (r.rowCount === 0) return res.status(400).json({ erro: 'Não foi possível remover (não existe ou é protegido).' });
  res.json({ ok: true });
});

/* ===================== ALUNOS ===================== */

// Lista alunos. Só master/adm (protege dados pessoais dos alunos).
router.get('/alunos', autenticar, exigirNivel('master', 'adm'), async (req, res) => {
  const r = await pool.query(
    `SELECT id, cpf, nome, email, telefone, data_nascimento AS nasc, turma, foto, estrelas
       FROM usuarios WHERE nivel='aluno' ORDER BY nome`
  );
  res.json(r.rows);
});

// Cria aluno. master/adm. Senha = data de nascimento (DDMMAAAA) se não enviada.
router.post('/alunos', autenticar, exigirNivel('master', 'adm'), async (req, res) => {
  try {
    const { nome, email, telefone, turma, foto } = req.body;
    const cpf = soDigitos(req.body.cpf);
    const nasc = req.body.nasc || req.body.data_nascimento || null;

    if (!nome || !cpf) return res.status(400).json({ erro: 'Nome e CPF são obrigatórios.' });

    const senha = req.body.senha || senhaPadraoAluno(nasc);
    if (!senha) return res.status(400).json({ erro: 'Sem senha: informe a data de nascimento ou uma senha.' });

    const hash = await bcrypt.hash(senha, SALT);
    const r = await pool.query(
      `INSERT INTO usuarios (cpf, senha_hash, nome, nivel, email, telefone, data_nascimento, turma, foto, estrelas)
       VALUES ($1,$2,$3,'aluno',$4,$5,$6,$7,$8,0)
       RETURNING id, cpf, nome, email, telefone, data_nascimento AS nasc, turma, foto, estrelas`,
      [cpf, hash, nome, email || null, telefone || null, nasc, turma || null, foto || null]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ erro: 'Já existe um aluno com esse CPF.' });
    console.error(e);
    res.status(500).json({ erro: 'Erro ao cadastrar aluno.' });
  }
});

// Atualiza aluno. master/adm.
router.put('/alunos/:id', autenticar, exigirNivel('master', 'adm'), async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, telefone, turma, foto, estrelas } = req.body;
    const cpf = soDigitos(req.body.cpf);
    const nasc = req.body.nasc || req.body.data_nascimento || null;

    const campos = [nome, cpf, email || null, telefone || null, nasc, turma || null, foto || null, estrelas || 0, id];
    let sql = `UPDATE usuarios SET nome=$1, cpf=$2, email=$3, telefone=$4, data_nascimento=$5,
                turma=$6, foto=$7, estrelas=$8`;
    if (req.body.senha) {
      const hash = await bcrypt.hash(req.body.senha, SALT);
      sql += `, senha_hash=$10`;
      campos.push(hash);
    }
    sql += ` WHERE id=$9 AND nivel='aluno'
             RETURNING id, cpf, nome, email, telefone, data_nascimento AS nasc, turma, foto, estrelas`;

    const r = await pool.query(sql, campos);
    if (r.rowCount === 0) return res.status(404).json({ erro: 'Aluno não encontrado.' });
    res.json(r.rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ erro: 'CPF já cadastrado.' });
    console.error(e);
    res.status(500).json({ erro: 'Erro ao atualizar aluno.' });
  }
});

// Remove aluno. master/adm.
router.delete('/alunos/:id', autenticar, exigirNivel('master', 'adm'), async (req, res) => {
  const r = await pool.query(`DELETE FROM usuarios WHERE id=$1 AND nivel='aluno' RETURNING id`, [req.params.id]);
  if (r.rowCount === 0) return res.status(404).json({ erro: 'Aluno não encontrado.' });
  res.json({ ok: true });
});

export default router;
