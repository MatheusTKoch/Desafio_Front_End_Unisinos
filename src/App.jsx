import React, { Component } from 'react';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import InstituicaoHome from './pages/InstituicaoHome';
import AlunoHome from './pages/AlunoHome';
import Ofertas from './pages/Ofertas';
import PreRequisitos from './pages/PreRequisitos';
import CargaProfessores from './pages/CargaProfessores';
import Catalogo from './pages/Catalogo';
import MinhasMatriculas from './pages/MinhasMatriculas';

class App extends Component {
  render() {
    const { usuario, telaAtual } = this.context;

    if (!usuario) {
      return <Login />;
    }

    // Instituição: nunca renderiza telas de aluno
    if (usuario.tipo === 'instituicao') {
      switch (telaAtual) {
        case 'ofertas':
          return <Ofertas />;
        case 'prerequisitos':
          return <PreRequisitos />;
        case 'carga':
          return <CargaProfessores />;
        case 'instituicao':
        default:
          return <InstituicaoHome />;
      }
    }

    // Aluno: nunca renderiza telas de instituição
    if (usuario.tipo === 'aluno') {
      switch (telaAtual) {
        case 'catalogo':
          return <Catalogo />;
        case 'minhas':
          return <MinhasMatriculas />;
        case 'aluno':
        default:
          return <AlunoHome />;
      }
    }

    return <Login />;
  }
}

App.contextType = AuthContext;

export default App;
