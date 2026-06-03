// ===== Rotas de login =====
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool, soDigitos } from '../db.js';
import { gerarToken, autenticar } from '../auth.js';

const router = Router();

// POST /api/login  { cpf, senha }
router.post('/login', async (req, res) => {
  try {
    const cpf = soDigitos(req.body.cpf);
    const senha = req.body.senha || '';

    if (!cpf || !senha) {
      return res.status(400).json({ erro: 'Informe CPF e senha.' });
    }

    const r = await pool.query('SELECT * FROM usuarios WHERE cpf = $1', [cpf]);
    if (r.rowCount === 0) {
      return res.status(401).json({ erro: 'CPF ou senha incorretos.' });
    }

    const u = r.rows[0];
    const ok = await bcrypt.compare(senha, u.senha_hash);
    if (!ok) {
      return res.status(401).json({ erro: 'CPF ou senha incorretos.' });
    }

    const token = gerarToken(u);
    res.json({
      token,
      usuario: { id: u.id, nome: u.nome, nivel: u.nivel, email: u.email },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: 'Erro no servidor.' });
  }
});

// GET /api/me  — dados do usuário logado (valida o token)
router.get('/me', autenticar, async (req, res) => {
  const r = await pool.query(
    `SELECT id, cpf, nome, nivel, email, telefone,
            data_nascimento AS nasc, foto, turma, estrelas
       FROM usuarios WHERE id = $1`,
    [req.usuario.id]
  );
  if (r.rowCount === 0) return res.status(404).json({ erro: 'Usuário não encontrado.' });
  res.json(r.rows[0]);
});

// PUT /api/me — usuário atualiza o PRÓPRIO perfil.
// Nunca muda o nível nem a foto (foto só o admin define no cadastro).
router.put('/me', autenticar, async (req, res) => {
  try {
    const id = req.usuario.id;
    const nome = (req.body.nome || '').trim();
    if (!nome) return res.status(400).json({ erro: 'O nome é obrigatório.' });

    const email    = req.body.email || null;
    const telefone = req.body.telefone || null;
    const cpf      = soDigitos(req.body.cpf);
    const nasc     = req.body.data_nascimento || req.body.nasc || null;

    const sets = ['nome = $1', 'email = $2', 'telefone = $3'];
    const vals = [nome, email, telefone];
    let i = 4;
    if (cpf)  { sets.push(`cpf = $${i++}`);             vals.push(cpf); }
    if (nasc) { sets.push(`data_nascimento = $${i++}`); vals.push(nasc); }
    if (req.body.senha) {
      const hash = await bcrypt.hash(req.body.senha, 10);
      sets.push(`senha_hash = $${i++}`);
      vals.push(hash);
    }
    vals.push(id);

    const sql = `UPDATE usuarios SET ${sets.join(', ')} WHERE id = $${i}
      RETURNING id, cpf, nome, nivel, email, telefone, data_nascimento AS nasc, foto, turma, estrelas`;
    const r = await pool.query(sql, vals);
    if (r.rowCount === 0) return res.status(404).json({ erro: 'Usuário não encontrado.' });
    res.json(r.rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ erro: 'Esse CPF já está em uso.' });
    console.error(e);
    res.status(500).json({ erro: 'Erro ao atualizar perfil.' });
  }
});

export default router;
