// ===== Conexão com o PostgreSQL + criação das tabelas =====
import pkg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pkg;

// A DATABASE_URL vem do Render/Neon. SSL é obrigatório em produção.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost')
    ? false
    : { rejectUnauthorized: false },
});

// Remove tudo que não é dígito (para padronizar CPF)
export const soDigitos = (s) => (s || '').replace(/\D/g, '');

// Cria as tabelas (roda toda vez que o servidor sobe; usa IF NOT EXISTS)
export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id              SERIAL PRIMARY KEY,
      cpf             VARCHAR(11) UNIQUE NOT NULL,
      senha_hash      TEXT NOT NULL,
      nome            TEXT NOT NULL,
      nivel           VARCHAR(10) NOT NULL CHECK (nivel IN ('master','adm','aluno')),
      email           TEXT,
      telefone        TEXT,
      data_nascimento DATE,
      turma           INT,
      foto            TEXT,
      estrelas        INT DEFAULT 0,
      fixo            BOOLEAN DEFAULT FALSE,
      criado_em       TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS chamadas (
      id           SERIAL PRIMARY KEY,
      data         DATE NOT NULL,
      turma        INT  NOT NULL,
      frequencia   JSONB NOT NULL,
      presentes    INT,
      faltas       INT,
      justificadas INT,
      UNIQUE (data, turma)
    );

    CREATE TABLE IF NOT EXISTS horarios (
      id    SERIAL PRIMARY KEY,
      chave TEXT UNIQUE NOT NULL,
      dados JSONB NOT NULL
    );

    CREATE TABLE IF NOT EXISTS materiais (
      id           SERIAL PRIMARY KEY,
      nome         TEXT NOT NULL,
      descricao    TEXT,
      turma        TEXT,
      tipo         TEXT,
      arquivo_nome TEXT,
      arquivo_url  TEXT,
      criado_em    TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Cria o ADM Master a partir das variáveis de ambiente, se ainda não existir.
  const cpf = soDigitos(process.env.MASTER_CPF);
  const senha = process.env.MASTER_SENHA;
  const nome = process.env.MASTER_NOME || 'Administrador Master';

  if (cpf && senha) {
    const existe = await pool.query('SELECT id FROM usuarios WHERE cpf = $1', [cpf]);
    if (existe.rowCount === 0) {
      const hash = await bcrypt.hash(senha, 10);
      await pool.query(
        `INSERT INTO usuarios (cpf, senha_hash, nome, nivel, fixo)
         VALUES ($1, $2, $3, 'master', TRUE)`,
        [cpf, hash, nome]
      );
      console.log(`✓ ADM Master criado (CPF ${cpf}).`);
    }
  } else {
    console.warn('⚠ MASTER_CPF / MASTER_SENHA não definidos — nenhum master criado.');
  }

  console.log('✓ Banco de dados pronto.');
}
