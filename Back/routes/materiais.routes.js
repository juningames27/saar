// ===== Rotas de materiais =====
import { Router } from 'express';
import { pool } from '../db.js';
import { autenticar, exigirNivel } from '../auth.js';

const router = Router();

// Lista materiais
router.get('/', autenticar, async (req, res) => {
  const r = await pool.query('SELECT * FROM materiais ORDER BY criado_em DESC');
  res.json(r.rows);
});

// Cria material. master/adm.
router.post('/', autenticar, exigirNivel('master', 'adm'), async (req, res) => {
  try {
    const { nome, descricao, turma, tipo, arquivo_nome, arquivo_url } = req.body;
    if (!nome) return res.status(400).json({ erro: 'Nome do material é obrigatório.' });
    const r = await pool.query(
      `INSERT INTO materiais (nome, descricao, turma, tipo, arquivo_nome, arquivo_url)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [nome, descricao || null, turma || null, tipo || null, arquivo_nome || null, arquivo_url || null]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: 'Erro ao salvar material.' });
  }
});

// Remove material. master/adm.
router.delete('/:id', autenticar, exigirNivel('master', 'adm'), async (req, res) => {
  await pool.query('DELETE FROM materiais WHERE id=$1', [req.params.id]);
  res.json({ ok: true });
});

export default router;
