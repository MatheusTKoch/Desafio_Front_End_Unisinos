import React, { Component } from 'react';
import { AuthContext } from '../context/AuthContext';

class AlunoHome extends Component {
  render() {
    const { usuario, telaAtual, setTela, logout } = this.context;

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
          <h1>Área do Aluno</h1>
          <p>Olá, {usuario.nome}</p>
        </main>
      </div>
    );
  }
}

AlunoHome.contextType = AuthContext;

export default AlunoHome;
