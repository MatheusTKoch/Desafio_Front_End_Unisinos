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
    const { telaAtual, setTela, logout } = this.context;
    const { matriculas, erro } = this.state;

    return (
      <div>
        <nav className="navbar navbar-dark navbar-marca">
          <div className="container">
            <span className="navbar-brand">Matrículas</span>
            <ul className="navbar-nav">
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link${telaAtual === 'aluno' ? ' active' : ''}`}
                  onClick={() => setTela('aluno')}
                >
                  Início
                </button>
              </li>
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link${telaAtual === 'catalogo' ? ' active' : ''}`}
                  onClick={() => setTela('catalogo')}
                >
                  Catálogo
                </button>
              </li>
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link${telaAtual === 'minhas' ? ' active' : ''}`}
                  onClick={() => setTela('minhas')}
                >
                  Minhas matrículas
                </button>
              </li>
              <li className="nav-item">
                <button type="button" className="nav-link" onClick={logout}>
                  Sair
                </button>
              </li>
            </ul>
          </div>
        </nav>

        <main className="container py-4">
          <h1>Minhas matrículas</h1>

          {erro && <div className="alert alert-danger">{erro}</div>}

          <table className="table">
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
        </main>
      </div>
    );
  }
}

MinhasMatriculas.contextType = AuthContext;

export default MinhasMatriculas;
