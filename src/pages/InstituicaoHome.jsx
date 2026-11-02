import React, { Component } from 'react';
import { AuthContext } from '../context/AuthContext';

class InstituicaoHome extends Component {
  render() {
    const { usuario, logout, setTela } = this.context;

    return (
      <div>
        <h1>Área da Instituição</h1>
        <p>Olá, {usuario.nome}</p>

        <nav>
          <ul>
            <li>
              <button type="button" onClick={() => setTela('ofertas')}>
                Ofertas de turmas
              </button>
            </li>
            <li>
              <button type="button" onClick={() => setTela('prerequisitos')}>
                Pré-requisitos
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
