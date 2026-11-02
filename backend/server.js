import express from 'express';
import cors from 'cors';
import pool from './sql/pool.js';
import { requerTipo } from './middleware/auth.js';

const app = express();

// Configuração do CORS
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-usuario-tipo', 'x-usuario-id'],
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

function codigoHorario(diaSemana, turno) {
    return `${diaSemana}${turno}`;
}

function validarOferta(body) {
    const disciplinaid = Number(body.disciplinaid);
    const professorid = Number(body.professorid);
    const dia_semana = Number(body.dia_semana);
    const turno = Number(body.turno);
    const vagas = Number(body.vagas);

    if (!Number.isInteger(disciplinaid) || disciplinaid <= 0) {
        return { erro: 'Disciplina inválida' };
    }

    if (!Number.isInteger(professorid) || professorid <= 0) {
        return { erro: 'Professor inválido' };
    }

    if (!Number.isInteger(dia_semana) || dia_semana < 2 || dia_semana > 7) {
        return { erro: 'Dia da semana inválido' };
    }

    if (!Number.isInteger(turno) || ![1, 2, 3].includes(turno)) {
        return { erro: 'Turno inválido' };
    }

    if (!Number.isInteger(vagas) || vagas <= 0) {
        return { erro: 'Vagas devem ser maiores que zero' };
    }

    return {
        disciplinaid,
        professorid,
        dia_semana,
        turno,
        codigo_horario: codigoHorario(dia_semana, turno),
        vagas,
    };
}

function validarPrerequisito(body) {
    const disciplinaid = Number(body.disciplinaid);
    const disciplina_exigidaid = Number(body.disciplina_exigidaid);

    if (!Number.isInteger(disciplinaid) || disciplinaid <= 0) {
        return { erro: 'Disciplina inválida' };
    }

    if (!Number.isInteger(disciplina_exigidaid) || disciplina_exigidaid <= 0) {
        return { erro: 'Disciplina inválida' };
    }

    if (disciplinaid === disciplina_exigidaid) {
        return { erro: 'A disciplina não pode ser pré-requisito dela mesma' };
    }

    return { disciplinaid, disciplina_exigidaid };
}

const SQL_TURMAS = `
    SELECT
        t.turmaid,
        t.disciplinaid,
        t.professorid,
        d.codigo AS disciplina_codigo,
        d.nome AS disciplina_nome,
        p.nome AS professor_nome,
        t.dia_semana,
        t.turno,
        t.codigo_horario,
        t.vagas,
        COALESCE((
            SELECT COUNT(*)::int
            FROM matricula m
            WHERE m.turmaid = t.turmaid AND m.status = 'ativa'
        ), 0) AS vagas_ocupadas
    FROM turma t
    JOIN disciplina d ON d.disciplinaid = t.disciplinaid
    JOIN professor p ON p.professorid = t.professorid
`;

const SQL_PREREQUISITOS = `
    SELECT
        pr.prerequisitoid,
        pr.disciplinaid,
        pr.disciplina_exigidaid,
        d.codigo AS disciplina_codigo,
        d.nome AS disciplina_nome,
        e.codigo AS exigida_codigo,
        e.nome AS exigida_nome
    FROM prerequisito pr
    JOIN disciplina d ON d.disciplinaid = pr.disciplinaid
    JOIN disciplina e ON e.disciplinaid = pr.disciplina_exigidaid
`;

/* ROTAS */

// Rotas de instituicao
app.get('/api/disciplinas', requerTipo('instituicao'), async (_req, res) => {
    try {
        const result = await pool.query(
            `SELECT disciplinaid, codigo, nome
             FROM disciplina
             ORDER BY codigo`
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.get('/api/professores', requerTipo('instituicao'), async (_req, res) => {
    try {
        const result = await pool.query(
            `SELECT professorid, nome
             FROM professor
             ORDER BY nome`
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.get('/api/turmas', requerTipo('instituicao', 'aluno'), async (_req, res) => {
    try {
        const result = await pool.query(`${SQL_TURMAS} ORDER BY t.turmaid`);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.post('/api/turmas', requerTipo('instituicao'), async (req, res) => {
    const oferta = validarOferta(req.body || {});

    if (oferta.erro) {
        return res.status(400).json({ erro: oferta.erro });
    }

    try {
        const result = await pool.query(
            `INSERT INTO turma
                (disciplinaid, professorid, dia_semana, turno, codigo_horario, vagas)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING turmaid`,
            [
                oferta.disciplinaid,
                oferta.professorid,
                oferta.dia_semana,
                oferta.turno,
                oferta.codigo_horario,
                oferta.vagas,
            ]
        );

        const criada = await pool.query(
            `${SQL_TURMAS} WHERE t.turmaid = $1`,
            [result.rows[0].turmaid]
        );

        res.status(201).json(criada.rows[0]);
    } catch (err) {
        if (err.code === '23503') {
            return res.status(400).json({ erro: 'Disciplina ou professor inválido' });
        }
        res.status(500).json({ erro: err.message });
    }
});

app.put('/api/turmas/:turmaid', requerTipo('instituicao'), async (req, res) => {
    const turmaid = Number(req.params.turmaid);
    const oferta = validarOferta(req.body || {});

    if (!Number.isInteger(turmaid) || turmaid <= 0) {
        return res.status(400).json({ erro: 'Turma inválida' });
    }

    if (oferta.erro) {
        return res.status(400).json({ erro: oferta.erro });
    }

    try {
        const ocupacao = await pool.query(
            `SELECT COUNT(*)::int AS ocupadas
             FROM matricula
             WHERE turmaid = $1 AND status = 'ativa'`,
            [turmaid]
        );
        const ocupadas = Number(ocupacao.rows[0].ocupadas);

        if (oferta.vagas < ocupadas) {
            return res.status(400).json({
                erro: 'Vagas não podem ser menores que as matrículas ativas',
            });
        }

        const result = await pool.query(
            `UPDATE turma
             SET disciplinaid = $1,
                 professorid = $2,
                 dia_semana = $3,
                 turno = $4,
                 codigo_horario = $5,
                 vagas = $6
             WHERE turmaid = $7
             RETURNING turmaid`,
            [
                oferta.disciplinaid,
                oferta.professorid,
                oferta.dia_semana,
                oferta.turno,
                oferta.codigo_horario,
                oferta.vagas,
                turmaid,
            ]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ erro: 'Turma não encontrada' });
        }

        const atualizada = await pool.query(
            `${SQL_TURMAS} WHERE t.turmaid = $1`,
            [turmaid]
        );

        res.json(atualizada.rows[0]);
    } catch (err) {
        if (err.code === '23503') {
            return res.status(400).json({ erro: 'Disciplina ou professor inválido' });
        }
        res.status(500).json({ erro: err.message });
    }
});

app.delete('/api/turmas/:turmaid', requerTipo('instituicao'), async (req, res) => {
    const turmaid = Number(req.params.turmaid);

    if (!Number.isInteger(turmaid) || turmaid <= 0) {
        return res.status(400).json({ erro: 'Turma inválida' });
    }

    try {
        const result = await pool.query(
            `DELETE FROM turma WHERE turmaid = $1 RETURNING turmaid`,
            [turmaid]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ erro: 'Turma não encontrada' });
        }

        res.json({ turmaid });
    } catch (err) {
        if (err.code === '23503') {
            return res.status(409).json({
                erro: 'Não é possível remover uma turma que possui matrículas',
            });
        }
        res.status(500).json({ erro: err.message });
    }
});

app.get('/api/prerequisitos', requerTipo('instituicao'), async (_req, res) => {
    try {
        const result = await pool.query(
            `${SQL_PREREQUISITOS} ORDER BY d.codigo, e.codigo`
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.post('/api/prerequisitos', requerTipo('instituicao'), async (req, res) => {
    const prerequisito = validarPrerequisito(req.body || {});

    if (prerequisito.erro) {
        return res.status(400).json({ erro: prerequisito.erro });
    }

    try {
        const result = await pool.query(
            `INSERT INTO prerequisito (disciplinaid, disciplina_exigidaid)
             VALUES ($1, $2)
             RETURNING prerequisitoid`,
            [prerequisito.disciplinaid, prerequisito.disciplina_exigidaid]
        );

        const criado = await pool.query(
            `${SQL_PREREQUISITOS} WHERE pr.prerequisitoid = $1`,
            [result.rows[0].prerequisitoid]
        );

        res.status(201).json(criado.rows[0]);
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ erro: 'Este pré-requisito já existe' });
        }
        if (err.code === '23503') {
            return res.status(400).json({ erro: 'Disciplina inválida' });
        }
        if (err.code === '23514') {
            return res.status(400).json({
                erro: 'A disciplina não pode ser pré-requisito dela mesma',
            });
        }
        res.status(500).json({ erro: err.message });
    }
});

app.put('/api/prerequisitos/:prerequisitoid', requerTipo('instituicao'), async (req, res) => {
    const prerequisitoid = Number(req.params.prerequisitoid);
    const prerequisito = validarPrerequisito(req.body || {});

    if (!Number.isInteger(prerequisitoid) || prerequisitoid <= 0) {
        return res.status(400).json({ erro: 'Pré-requisito inválido' });
    }

    if (prerequisito.erro) {
        return res.status(400).json({ erro: prerequisito.erro });
    }

    try {
        const result = await pool.query(
            `UPDATE prerequisito
             SET disciplinaid = $1,
                 disciplina_exigidaid = $2
             WHERE prerequisitoid = $3
             RETURNING prerequisitoid`,
            [prerequisito.disciplinaid, prerequisito.disciplina_exigidaid, prerequisitoid]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ erro: 'Pré-requisito não encontrado' });
        }

        const atualizado = await pool.query(
            `${SQL_PREREQUISITOS} WHERE pr.prerequisitoid = $1`,
            [prerequisitoid]
        );

        res.json(atualizado.rows[0]);
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ erro: 'Este pré-requisito já existe' });
        }
        if (err.code === '23503') {
            return res.status(400).json({ erro: 'Disciplina inválida' });
        }
        if (err.code === '23514') {
            return res.status(400).json({
                erro: 'A disciplina não pode ser pré-requisito dela mesma',
            });
        }
        res.status(500).json({ erro: err.message });
    }
});

app.delete('/api/prerequisitos/:prerequisitoid', requerTipo('instituicao'), async (req, res) => {
    const prerequisitoid = Number(req.params.prerequisitoid);

    if (!Number.isInteger(prerequisitoid) || prerequisitoid <= 0) {
        return res.status(400).json({ erro: 'Pré-requisito inválido' });
    }

    try {
        const result = await pool.query(
            `DELETE FROM prerequisito WHERE prerequisitoid = $1 RETURNING prerequisitoid`,
            [prerequisitoid]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ erro: 'Pré-requisito não encontrado' });
        }

        res.json({ prerequisitoid });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// Rotas de aluno
app.get('/api/matriculas', requerTipo('aluno'), async (req, res) => {
    const usuarioid = req.usuarioid;

    if (!usuarioid) {
        return res.status(401).json({ erro: 'Identificador de usuário não informado' });
    }

    try {
        const aluno = await pool.query(
            `SELECT usuarioid
             FROM usuario
             WHERE usuarioid = $1 AND tipo = 'aluno'`,
            [usuarioid]
        );

        if (aluno.rowCount === 0) {
            return res.status(403).json({ erro: 'Acesso negado para este papel' });
        }

        const result = await pool.query(
            `SELECT
                m.matriculaid,
                m.status,
                t.turmaid,
                d.codigo AS disciplina_codigo,
                d.nome AS disciplina_nome,
                p.nome AS professor_nome,
                t.dia_semana,
                t.turno,
                t.codigo_horario
             FROM matricula m
             JOIN turma t ON t.turmaid = m.turmaid
             JOIN disciplina d ON d.disciplinaid = t.disciplinaid
             JOIN professor p ON p.professorid = t.professorid
             WHERE m.usuarioid = $1
             ORDER BY d.codigo, t.codigo_horario`,
            [usuarioid]
        );

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.post('/api/matriculas', requerTipo('aluno'), async (req, res) => {
    const turmaid = Number(req.body?.turmaid);
    const usuarioid = req.usuarioid;

    if (!usuarioid) {
        return res.status(401).json({ erro: 'Identificador de usuário não informado' });
    }

    if (!Number.isInteger(turmaid) || turmaid <= 0) {
        return res.status(400).json({ erro: 'Turma inválida' });
    }

    try {
        const aluno = await pool.query(
            `SELECT usuarioid
             FROM usuario
             WHERE usuarioid = $1 AND tipo = 'aluno'`,
            [usuarioid]
        );

        if (aluno.rowCount === 0) {
            return res.status(403).json({ erro: 'Acesso negado para este papel' });
        }

        const turma = await pool.query(
            `SELECT t.disciplinaid,
                    t.vagas,
                    COALESCE((
                        SELECT COUNT(*)::int
                        FROM matricula m
                        WHERE m.turmaid = t.turmaid AND m.status = 'ativa'
                    ), 0) AS ocupadas
             FROM turma t
             WHERE t.turmaid = $1`,
            [turmaid]
        );

        if (turma.rowCount === 0) {
            return res.status(404).json({ erro: 'Turma não encontrada' });
        }

        const existente = await pool.query(
            `SELECT matriculaid
             FROM matricula
             WHERE usuarioid = $1 AND turmaid = $2`,
            [usuarioid, turmaid]
        );

        if (existente.rowCount > 0) {
            return res.status(409).json({ erro: 'Você já possui matrícula nesta turma' });
        }

        const faltantes = await pool.query(
            `SELECT d.codigo, d.nome
             FROM prerequisito p
             JOIN disciplina d ON d.disciplinaid = p.disciplina_exigidaid
             WHERE p.disciplinaid = $1
               AND NOT EXISTS (
                   SELECT 1
                   FROM matricula m
                   JOIN turma t ON t.turmaid = m.turmaid
                   WHERE m.usuarioid = $2
                     AND m.status = 'concluida'
                     AND t.disciplinaid = p.disciplina_exigidaid
               )
             ORDER BY d.codigo`,
            [turma.rows[0].disciplinaid, usuarioid]
        );

        if (faltantes.rowCount > 0) {
            const lista = faltantes.rows
                .map((disciplina) => `${disciplina.codigo} — ${disciplina.nome}`)
                .join('; ');

            return res.status(409).json({
                erro: `Falta pré-requisito concluído: ${lista}`,
            });
        }

        const vagas = Number(turma.rows[0].vagas);
        const ocupadas = Number(turma.rows[0].ocupadas);

        if (ocupadas >= vagas) {
            return res.status(409).json({ erro: 'Sem vagas nesta turma' });
        }

        const criada = await pool.query(
            `INSERT INTO matricula (usuarioid, turmaid, status)
             VALUES ($1, $2, 'ativa')
             RETURNING matriculaid, usuarioid, turmaid, status`,
            [usuarioid, turmaid]
        );

        res.status(201).json(criada.rows[0]);
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ erro: 'Você já possui matrícula nesta turma' });
        }
        res.status(500).json({ erro: err.message });
    }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});