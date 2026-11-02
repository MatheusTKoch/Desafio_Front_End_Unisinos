import pg from 'pg';
import db from './pool.js';

const { Pool } = pg;

// Credenciais iguais ao pool, mas conecta no banco default "postgres"
// (é preciso existir uma conexão válida para poder criar outro banco)
const adminConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'masterkey',
  port: 5432,
};

async function ensureDatabase() {
  const admin = new Pool(adminConfig);
  try {
    const result = await admin.query(
      `SELECT 1 FROM pg_database WHERE datname = 'plataforma_academica'`
    );

    if (result.rowCount === 0) {
      console.log('Criando banco plataforma_academica...');
      await admin.query('CREATE DATABASE plataforma_academica');
      console.log('Banco criado.');
    } else {
      console.log('Banco plataforma_academica ja existe.');
    }
  } finally {
    await admin.end();
  }
}

async function createSchema() {
  try {
    console.log('Criando schema...');

    await ensureDatabase();

    await db.query(`
            CREATE TABLE IF NOT EXISTS usuario (
                usuarioid   SERIAL PRIMARY KEY,
                nome        VARCHAR(120) NOT NULL,
                email       VARCHAR(120) NOT NULL UNIQUE,
                senha       VARCHAR(255) NOT NULL,
                tipo        VARCHAR(20)  NOT NULL CHECK (tipo IN ('instituicao', 'aluno'))
                );
        `);

    await db.query(`
            CREATE TABLE IF NOT EXISTS disciplina (
                disciplinaid SERIAL PRIMARY KEY,
                codigo       VARCHAR(20)  NOT NULL UNIQUE,
                nome         VARCHAR(120) NOT NULL
                );
        `);

    await db.query(`
            CREATE TABLE IF NOT EXISTS professor (
                professorid SERIAL PRIMARY KEY,
                nome        VARCHAR(120) NOT NULL
                );    
        `);

    await db.query(`
            CREATE TABLE IF NOT EXISTS turma (
                turmaid         SERIAL PRIMARY KEY,
                disciplinaid    INTEGER NOT NULL,
                professorid     INTEGER NOT NULL,
                dia_semana      SMALLINT NOT NULL CHECK (dia_semana BETWEEN 2 AND 7),
                turno           SMALLINT NOT NULL CHECK (turno IN (1, 2, 3)),
                codigo_horario  VARCHAR(2) NOT NULL,
                vagas           INTEGER NOT NULL CHECK (vagas > 0),
                CONSTRAINT fk_turma_disciplina
                    FOREIGN KEY (disciplinaid) REFERENCES disciplina (disciplinaid),
                CONSTRAINT fk_turma_professor
                    FOREIGN KEY (professorid) REFERENCES professor (professorid)
                );
        `);

    await db.query(`
            CREATE TABLE IF NOT EXISTS matricula (
                matriculaid SERIAL PRIMARY KEY,
                usuarioid   INTEGER NOT NULL,
                turmaid     INTEGER NOT NULL,
                status      VARCHAR(20) NOT NULL DEFAULT 'ativa'
                            CHECK (status IN ('ativa', 'cancelada', 'concluida')),
                CONSTRAINT fk_matricula_usuario
                    FOREIGN KEY (usuarioid) REFERENCES usuario (usuarioid),
                CONSTRAINT fk_matricula_turma
                    FOREIGN KEY (turmaid) REFERENCES turma (turmaid),
                CONSTRAINT uq_matricula_aluno_turma
                    UNIQUE (usuarioid, turmaid)
                );
        `);

    await db.query(`
            CREATE TABLE IF NOT EXISTS prerequisito (
                prerequisitoid       SERIAL PRIMARY KEY,
                disciplinaid         INTEGER NOT NULL,
                disciplina_exigidaid INTEGER NOT NULL,
                CONSTRAINT fk_prereq_disciplina
                    FOREIGN KEY (disciplinaid) REFERENCES disciplina (disciplinaid),
                CONSTRAINT fk_prereq_exigida
                    FOREIGN KEY (disciplina_exigidaid) REFERENCES disciplina (disciplinaid),
                CONSTRAINT uq_prerequisito
                    UNIQUE (disciplinaid, disciplina_exigidaid),
                CONSTRAINT ck_prereq_diferente
                    CHECK (disciplinaid <> disciplina_exigidaid)
                );
        `);

    console.log('Schema criado com sucesso!');
  } catch (err) {
    console.error('Erro ao criar schema:', err.message);
  } finally {
    await db.end();
  }
}

createSchema();
