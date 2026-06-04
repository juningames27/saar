// ===== Servidor principal do SAAR =====
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { initDb, pool } from './db.js';
import authRoutes from './routes/auth.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';
import chamadasRoutes from './routes/chamadas.routes.js';
import horariosRoutes from './routes/horarios.routes.js';
import materiaisRoutes from './routes/materiais.routes.js';

const app = express();

// Corpo das requisições em JSON (limite maior por causa das fotos em base64)
app.use(express.json({ limit: '8mb' }));

// CORS — libera o domínio do front (Vercel). Em dev, libera tudo.
const origem = process.env.CORS_ORIGIN; // ex: https://saar.vercel.app
app.use(cors({ origin: origem ? origem.split(',') : true }));

// Healthcheck (Render usa pra saber se o serviço está vivo)
app.get('/', (req, res) => res.json({ ok: true, servico: 'SAAR API' }));

// Ping que TOCA no banco — usado por um cron externo pra manter
// Render e Neon acordados (evita o "alguns segundos" de cold start).
app.get('/ping', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false });
  }
});

// Rotas
app.use('/api', authRoutes);
app.use('/api', usuariosRoutes);
app.use('/api/chamadas', chamadasRoutes);
app.use('/api/horarios', horariosRoutes);
app.use('/api/materiais', materiaisRoutes);

const PORT = process.env.PORT || 3000;

initDb()
  .then(() => {
    app.listen(PORT, () => console.log(`✓ Servidor rodando na porta ${PORT}`));
  })
  .catch((e) => {
    console.error('Falha ao iniciar o banco:', e);
    process.exit(1);
  });
