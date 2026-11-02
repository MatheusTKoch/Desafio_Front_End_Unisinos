import React, { Component } from 'react';
import { AuthContext } from '../context/AuthContext';

class AlunoHome extends Component {
  render() {
    const { usuario, logout } = this.context;

    return (
      <div>
        <h1>Área do Aluno</h1>
        <p>Olá, {usuario.nome}</p>

        <nav>
          <ul>
            <li>
              <button type="button" disabled>
                Catálogo de turmas (em breve)
              </button>
            </li>
            <li>
              <button type="button" disabled>
                Minhas matrículas (em breve)
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

AlunoHome.contextType = AuthContext;

export default AlunoHome;
