// ===== Rotas de materiais =====
import { Router } from 'express';
import { pool } from '../db.js';
import { autenticar, exigirNivel } from '../auth.js';

const router = Router();

// Lista materiais (sem o conteúdo do arquivo — deixa a lista leve)
router.get('/', autenticar, async (req, res) => {
  const r = await pool.query(`
    SELECT id, nome, descricao, turma, tipo, arquivo_nome, criado_em,
           (arquivo_url IS NOT NULL) AS tem_arquivo
      FROM materiais ORDER BY criado_em DESC`);
  res.json(r.rows);
});

// Serve o ARQUIVO em si numa URL real (público → abre no celular).
// ?download=1 força baixar; sem isso, abre embutido (inline).
router.get('/:id/arquivo', async (req, res) => {
  try {
    const r = await pool.query('SELECT arquivo_url, arquivo_nome FROM materiais WHERE id = $1', [req.params.id]);
    if (r.rowCount === 0 || !r.rows[0].arquivo_url) return res.status(404).send('Arquivo não encontrado.');

    const m = r.rows[0].arquivo_url.match(/^data:([^;]+);base64,(.*)$/s);
    if (!m) return res.status(415).send('Formato de arquivo inválido.');

    const mime   = m[1];
    const buffer = Buffer.from(m[2], 'base64');
    const nome   = (r.rows[0].arquivo_nome || 'arquivo').replace(/["\r\n]/g, '');
    const disp   = req.query.download ? 'attachment' : 'inline';

    res.setHeader('Content-Type', mime);
    res.setHeader('Content-Disposition', `${disp}; filename="${nome}"`);
    res.setHeader('Cache-Control', 'private, max-age=3600');
    res.send(buffer);
  } catch (e) {
    console.error(e);
    res.status(500).send('Erro ao servir o arquivo.');
  }
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
