import pg from 'pg';
const { Pool } = pg;

// Configuração do pool de conexões
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'plataforma_academica',
  password: 'masterkey',
  port: 5432,
});

export default pool;