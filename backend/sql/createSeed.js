import db from './pool.js';

// Insere os dados de teste no banco de dados
async function createSeed() {
    try {
        console.log('Inserindo seed...');

        await db.query(`
            INSERT INTO usuario (nome, email, senha, tipo) VALUES
              ('Admin Instituicao', 'instituicao@unisinos.br', '123456', 'instituicao'),
              ('Ana Aluna',         'ana@aluno.unisinos.br',   '123456', 'aluno'),
              ('Bruno Aluno',       'bruno@aluno.unisinos.br', '123456', 'aluno');
        `);

        await db.query(`
            INSERT INTO disciplina (codigo, nome) VALUES
              ('ALG1', 'Algoritmos I'),
              ('ALG2', 'Algoritmos II'),
              ('BD1',  'Banco de Dados I'),
              ('POO1', 'Programacao Orientada a Objetos');
        `);

        await db.query(`
            INSERT INTO professor (nome) VALUES
              ('Prof. Carla Mendes'),
              ('Prof. Diego Souza'),
              ('Prof. Elena Rocha');
        `);

        await db.query(`
            INSERT INTO turma (disciplinaid, professorid, dia_semana, turno, codigo_horario, vagas) VALUES
              (1, 1, 2, 1, '21', 40),
              (2, 1, 3, 3, '33', 35),
              (3, 2, 4, 2, '42', 30),
              (4, 3, 2, 3, '23', 40);
        `);

        await db.query(`
            INSERT INTO prerequisito (disciplinaid, disciplina_exigidaid) VALUES
              (2, 1);
        `);

        await db.query(`
            INSERT INTO matricula (usuarioid, turmaid, status) VALUES
              (2, 1, 'concluida'),
              (2, 3, 'ativa');
        `);

        console.log('Seed inserido com sucesso!');
    } catch (err) {
        console.error('Erro ao inserir seed:', err.message);
    } finally {
        await db.end();
    }
}

createSeed();
