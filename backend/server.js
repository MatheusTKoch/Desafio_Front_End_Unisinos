import express from 'express';
import cors from 'cors';
import pool from './sql/pool.js';

const app = express();

// Configuração do CORS
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Configuração do Express
app.use(express.json());

// Conexão com o PostgreSQL
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    console.log('PostgreSQL conectado');
    release();
});

// Check se o banco está conectado
app.get('/api/health', async (_req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ ok: true, database: 'plataforma_academica' });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});