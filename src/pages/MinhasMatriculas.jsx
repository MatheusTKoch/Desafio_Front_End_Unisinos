import React, { Component } from 'react';
import { AuthContext } from '../context/AuthContext';
import { listarMinhasMatriculas } from '../services/api';

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

const STATUS = {
  ativa: 'Ativa',
  cancelada: 'Cancelada',
  concluida: 'Concluída',
};

function nomeDia(dia) {
  return DIAS.find((item) => item.valor === Number(dia))?.nome || dia;
}

function nomeTurno(turno) {
  return TURNOS.find((item) => item.valor === Number(turno))?.nome || turno;
}

function nomeStatus(status) {
  return STATUS[status] || status;
}

class MinhasMatriculas extends Component {
  constructor(props) {
    super(props);
    this.state = {
      matriculas: [],
      erro: '',
    };
  }

  componentDidMount() {
    this.carregar();
  }

  carregar = async () => {
    try {
      const matriculas = await listarMinhasMatriculas(this.context.usuario);
      this.setState({ matriculas, erro: '' });
    } catch (err) {
      this.setState({ erro: err.message });
    }
  };

  render() {
    const { setTela } = this.context;
    const { matriculas, erro } = this.state;

    return (
      <div>
        <h1>Minhas matrículas</h1>
        <button type="button" onClick={() => setTela('aluno')}>
          Voltar
        </button>

        {erro && <p>{erro}</p>}

        <table>
          <thead>
            <tr>
              <th>Disciplina</th>
              <th>Professor</th>
              <th>Horário</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {matriculas.map((matricula) => (
              <tr key={matricula.matriculaid}>
                <td>
                  {matricula.disciplina_codigo} — {matricula.disciplina_nome}
                </td>
                <td>{matricula.professor_nome}</td>
                <td>
                  {matricula.codigo_horario} ({nomeDia(matricula.dia_semana)} / {nomeTurno(matricula.turno)})
                </td>
                <td>{nomeStatus(matricula.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

MinhasMatriculas.contextType = AuthContext;

export default MinhasMatriculas;
