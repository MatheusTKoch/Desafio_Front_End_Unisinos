import React, { Component } from 'react';
import { AuthContext } from '../context/AuthContext';

class InstituicaoHome extends Component {
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
          <h1>Área da Instituição</h1>
          <p>Olá, {usuario.nome}</p>
        </main>
      </div>
    );
  }
}

InstituicaoHome.contextType = AuthContext;

export default InstituicaoHome;
