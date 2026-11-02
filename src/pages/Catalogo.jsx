import React, { Component } from 'react';
import { AuthContext } from '../context/AuthContext';
import { listarTurmas, matricular } from '../services/api';

const DIAS = [
  { valor: 2, nome: 'Segunda' },
  { valor: 3, nome: 'Terça' },
  { valor: 4, nome: 'Quarta' },
  { valor: 5, nome: 'Quinta' },
  { valor: 6, nome: 'Sexta' },
  { valor: 7, nome: 'Sábado' },
];

const TURNOS = [
  { valor: 1, nome: 'Manhã' },
  { valor: 2, nome: 'Tarde' },
  { valor: 3, nome: 'Noite' },
];

function nomeDia(dia) {
  return DIAS.find((item) => item.valor === Number(dia))?.nome || dia;
}

function nomeTurno(turno) {
  return TURNOS.find((item) => item.valor === Number(turno))?.nome || turno;
}

class Catalogo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      turmas: [],
      erro: '',
      mensagem: '',
    };
  }

  componentDidMount() {
    this.carregar();
  }

  carregar = async () => {
    try {
      const turmas = await listarTurmas(this.context.usuario);
      this.setState({ turmas, erro: '' });
    } catch (err) {
      this.setState({ erro: err.message });
    }
  };

  matricular = async (turma) => {
    try {
      await matricular(this.context.usuario, turma.turmaid);
      this.setState({
        mensagem: `Matrícula realizada em ${turma.disciplina_codigo}.`,
        erro: '',
      });
      await this.carregar();
    } catch (err) {
      this.setState({ erro: err.message, mensagem: '' });
    }
  };

  render() {
    const { setTela } = this.context;
    const { turmas, erro, mensagem } = this.state;

    return (
      <div>
        <h1>Catálogo de turmas</h1>
        <button type="button" onClick={() => setTela('aluno')}>
          Voltar
        </button>

        {erro && <p>{erro}</p>}
        {mensagem && <p>{mensagem}</p>}

        <table>
          <thead>
            <tr>
              <th>Disciplina</th>
              <th>Professor</th>
              <th>Horário</th>
              <th>Vagas</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {turmas.map((turma) => (
              <tr key={turma.turmaid}>
                <td>
                  {turma.disciplina_codigo} — {turma.disciplina_nome}
                </td>
                <td>{turma.professor_nome}</td>
                <td>
                  {turma.codigo_horario} ({nomeDia(turma.dia_semana)} / {nomeTurno(turma.turno)})
                </td>
                <td>
                  {turma.vagas_ocupadas}/{turma.vagas}
                </td>
                <td>
                  <button type="button" onClick={() => this.matricular(turma)}>
                    Matricular
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

Catalogo.contextType = AuthContext;

export default Catalogo;
