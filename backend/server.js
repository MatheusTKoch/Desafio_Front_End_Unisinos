import express from 'express';
import cors from 'cors';
import pool from './sql/pool.js';

const app = express();

// Configuração do CORS
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-usuario-tipo'],
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

// Login: email + senha → dados do usuário (sem senha)
app.post('/api/login', async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
    }

    try {
        const result = await pool.query(
            `SELECT usuarioid, nome, email, tipo
             FROM usuario
             WHERE email = $1 AND senha = $2`,
            [email, senha]
        );

        if (result.rowCount === 0) {
            return res.status(401).json({ erro: 'Credenciais inválidas' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});