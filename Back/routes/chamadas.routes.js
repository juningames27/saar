// ===== Rotas de chamada (frequência) =====
import { Router } from 'express';
import { pool } from '../db.js';
import { autenticar, exigirNivel } from '../auth.js';

const router = Router();

// Lista todas as chamadas (histórico). Só master/adm.
router.get('/', autenticar, exigirNivel('master', 'adm'), async (req, res) => {
  const r = await pool.query('SELECT * FROM chamadas ORDER BY data DESC, turma');
  res.json(r.rows);
});

// Busca a chamada de uma turma+data específica. Só master/adm.
router.get('/:data/:turma', autenticar, exigirNivel('master', 'adm'), async (req, res) => {
  const r = await pool.query('SELECT * FROM chamadas WHERE data=$1 AND turma=$2', [
    req.params.data, req.params.turma,
  ]);
  res.json(r.rows[0] || null);
});

// Salva/atualiza chamada (upsert por data+turma). master/adm.
router.post('/', autenticar, exigirNivel('master', 'adm'), async (req, res) => {
  try {
    const { data, turma, frequencia, presentes, faltas, justificadas } = req.body;
    if (!data || !turma) return res.status(400).json({ erro: 'Data e turma são obrigatórias.' });

    const r = await pool.query(
      `INSERT INTO chamadas (data, turma, frequencia, presentes, faltas, justificadas)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (data, turma)
       DO UPDATE SET frequencia=$3, presentes=$4, faltas=$5, justificadas=$6
       RETURNING *`,
      [data, turma, JSON.stringify(frequencia || {}), presentes || 0, faltas || 0, justificadas || 0]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: 'Erro ao salvar chamada.' });
  }
});

// Remove uma chamada. master/adm.
router.delete('/:id', autenticar, exigirNivel('master', 'adm'), async (req, res) => {
  await pool.query('DELETE FROM chamadas WHERE id=$1', [req.params.id]);
  res.json({ ok: true });
});

export default router;
