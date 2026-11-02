import express from 'express';
import cors from 'cors';
import pool from './pool.js';

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
    release();
});



app.listen(3000, () => {
  console.log('Server is running on port 3000');
});