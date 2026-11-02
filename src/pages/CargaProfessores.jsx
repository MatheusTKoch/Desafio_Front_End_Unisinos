import React, { Component } from 'react';
import { AuthContext } from '../context/AuthContext';
import { listarCarga } from '../services/api';

function mediaCarga(professores) {
  const soma = professores.reduce((total, professor) => total + professor.turmas, 0);
  return soma / professores.length;
}

class CargaProfessores extends Component {
  constructor(props) {
    super(props);
    this.state = {
      professores: [],
      erro: '',
      carregado: false,
    };
  }

  componentDidMount() {
    this.carregar();
  }

  carregar = async () => {
    try {
      const professores = await listarCarga(this.context.usuario);
      this.setState({ professores, erro: '', carregado: true });
    } catch (err) {
      this.setState({ erro: err.message, carregado: true });
    }
  };

  render() {
    const { usuario, telaAtual, setTela, logout } = this.context;
    const { professores, erro, carregado } = this.state;
    const media = professores.length > 0 ? mediaCarga(professores) : null;

    return (
      <div>
        <nav className="navbar navbar-dark navbar-marca">
          <div className="container">
            <span className="navbar-brand">Matrículas</span>
            <ul className="navbar-nav">
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link${telaAtual === 'instituicao' ? ' active' : ''}`}
                  onClick={() => setTela('instituicao')}
                >
                  Início
                </button>
              </li>
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link${telaAtual === 'ofertas' ? ' active' : ''}`}
                  onClick={() => setTela('ofertas')}
                >
                  Ofertas
                </button>
              </li>
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link${telaAtual === 'prerequisitos' ? ' active' : ''}`}
                  onClick={() => setTela('prerequisitos')}
                >
                  Pré-requisitos
                </button>
              </li>
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link${telaAtual === 'carga' ? ' active' : ''}`}
                  onClick={() => setTela('carga')}
                >
                  Carga
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
          <h1>Carga de professores</h1>
          <p>Olá, {usuario.nome}. Quantidade de turmas ofertadas por professor.</p>

          {erro && <div className="alert alert-danger">{erro}</div>}

          {media !== null && (
            <p>
              Média: {media.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} turmas por professor.
            </p>
          )}

          {carregado && professores.length === 0 && !erro && <p>Nenhum professor cadastrado.</p>}

          {professores.length > 0 && (
            <table className="table">
              <thead>
                <tr>
                  <th>Professor</th>
                  <th>Turmas</th>
                  <th>Situação</th>
                </tr>
              </thead>
              <tbody>
                {professores.map((professor) => {
                  const acima = professor.turmas > media;

                  return (
                    <tr key={professor.professorid} className={acima ? 'carga-acima' : undefined}>
                      <td>{professor.nome}</td>
                      <td>{professor.turmas}</td>
                      <td>{acima ? 'Acima da média' : ''}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </main>
      </div>
    );
  }
}

CargaProfessores.contextType = AuthContext;

export default CargaProfessores;
