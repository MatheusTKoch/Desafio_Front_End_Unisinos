import React, { Component } from 'react';
import { AuthContext } from '../context/AuthContext';
import { login as loginApi } from '../services/api';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      senha: '',
      erro: '',
    };
  }

  handleChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
      erro: '',
    });
  };

  handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const usuario = await loginApi(this.state.email, this.state.senha);
      this.context.login(usuario);
    } catch (err) {
      this.setState({ erro: err.message });
    }
  };

  render() {
    return (
      <div>
        <h1>Login</h1>
        <p>Sistema de atendimento e matrículas</p>

        <form onSubmit={this.handleSubmit}>
          <div>
            <label htmlFor="email">Email</label>
            <br />
            <input
              id="email"
              type="email"
              name="email"
              value={this.state.email}
              onChange={this.handleChange}
              required
            />
          </div>

          <br />

          <div>
            <label htmlFor="senha">Senha</label>
            <br />
            <input
              id="senha"
              type="password"
              name="senha"
              value={this.state.senha}
              onChange={this.handleChange}
              required
            />
          </div>

          <br />

          {this.state.erro && <p>{this.state.erro}</p>}

          <button type="submit">Entrar</button>
        </form>
      </div>
    );
  }
}

Login.contextType = AuthContext;

export default Login;
