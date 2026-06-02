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
    'SELECT id, cpf, nome, nivel, email, telefone FROM usuarios WHERE id = $1',
    [req.usuario.id]
  );
  if (r.rowCount === 0) return res.status(404).json({ erro: 'Usuário não encontrado.' });
  res.json(r.rows[0]);
});

export default router;
