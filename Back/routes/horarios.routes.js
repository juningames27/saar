// ===== Rotas de horário =====
import { Router } from 'express';
import { pool } from '../db.js';
import { autenticar, exigirNivel } from '../auth.js';

const router = Router();

// Busca o horário de uma chave (ex: "2026_5"). Devolve null se não houver.
router.get('/:chave', autenticar, async (req, res) => {
  const r = await pool.query('SELECT dados FROM horarios WHERE chave=$1', [req.params.chave]);
  res.json(r.rowCount ? r.rows[0].dados : null);
});

// Salva/atualiza o horário de uma chave. master/adm.
router.put('/:chave', autenticar, exigirNivel('master', 'adm'), async (req, res) => {
  try {
    const dados = req.body.dados ?? req.body;
    const r = await pool.query(
      `INSERT INTO horarios (chave, dados) VALUES ($1,$2)
       ON CONFLICT (chave) DO UPDATE SET dados=$2 RETURNING dados`,
      [req.params.chave, JSON.stringify(dados)]
    );
    res.json(r.rows[0].dados);
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: 'Erro ao salvar horário.' });
  }
});

// Reseta (apaga) o horário de uma chave. master/adm.
router.delete('/:chave', autenticar, exigirNivel('master', 'adm'), async (req, res) => {
  await pool.query('DELETE FROM horarios WHERE chave=$1', [req.params.chave]);
  res.json({ ok: true });
});

export default router;
