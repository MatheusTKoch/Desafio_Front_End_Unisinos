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
      <div className="container-fluid">
        <div className="row min-vh-100">
          <div className="col-md-6 login-painel">
            <div>
              <h1>Matrículas</h1>
              <p>Sistema de atendimento e matrículas</p>
            </div>
          </div>

          <div className="col-md-6 login-form">
            <form className="login-box" onSubmit={this.handleSubmit}>
              <h2>Acesso</h2>

              <div className="mb-3">
                <label className="form-label" htmlFor="email">
                  Email
                </label>
                <input
                  className="form-control"
                  id="email"
                  type="email"
                  name="email"
                  value={this.state.email}
                  onChange={this.handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="senha">
                  Senha
                </label>
                <input
                  className="form-control"
                  id="senha"
                  type="password"
                  name="senha"
                  value={this.state.senha}
                  onChange={this.handleChange}
                  required
                />
              </div>

              {this.state.erro && <div className="alert alert-danger">{this.state.erro}</div>}

              <button className="btn btn-primary" type="submit">
                Entrar
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

Login.contextType = AuthContext;

export default Login;
