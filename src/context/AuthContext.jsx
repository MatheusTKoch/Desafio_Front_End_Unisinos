import React, { Component, createContext } from 'react';

const AuthContext = createContext(null);

class AuthProvider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      usuario: null,
      telaAtual: 'login',
    };
  }

  login = (usuario) => {
    this.setState({
      usuario,
      telaAtual: usuario.tipo,
    });
  };

  logout = () => {
    this.setState({
      usuario: null,
      telaAtual: 'login',
    });
  };

  setTela = (telaAtual) => {
    this.setState({ telaAtual });
  };

  render() {
    const valor = {
      usuario: this.state.usuario,
      telaAtual: this.state.telaAtual,
      login: this.login,
      logout: this.logout,
      setTela: this.setTela,
    };

    return (
      <AuthContext.Provider value={valor}>
        {this.props.children}
      </AuthContext.Provider>
    );
  }
}

export { AuthContext, AuthProvider };
