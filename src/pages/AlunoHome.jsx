import React, { Component } from 'react';
import { AuthContext } from '../context/AuthContext';

class AlunoHome extends Component {
  render() {
    const { usuario, logout, setTela } = this.context;

    return (
      <div>
        <h1>Área do Aluno</h1>
        <p>Olá, {usuario.nome}</p>

        <nav>
          <ul>
            <li>
              <button type="button" onClick={() => setTela('catalogo')}>
                Catálogo de turmas
              </button>
            </li>
            <li>
              <button type="button" onClick={() => setTela('minhas')}>
                Minhas matrículas
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
