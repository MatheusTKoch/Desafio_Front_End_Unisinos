import React, { Component } from 'react';
import { AuthContext } from '../context/AuthContext';

class InstituicaoHome extends Component {
  render() {
    const { usuario, logout } = this.context;

    return (
      <div>
        <h1>Área da Instituição</h1>
        <p>Olá, {usuario.nome}</p>

        <nav>
          <ul>
            <li>
              <button type="button" disabled>
                Ofertas de turmas (em breve)
              </button>
            </li>
            <li>
              <button type="button" disabled>
                Pré-requisitos (em breve)
              </button>
            </li>
            <li>
              <button type="button" disabled>
                Carga de professores (em breve)
              </button>
            </li>
          </ul>
        </nav>

        <button type="button" onClick={logout}>
          Sair
        </button>
      </div>
    );
  }
}

InstituicaoHome.contextType = AuthContext;

export default InstituicaoHome;
