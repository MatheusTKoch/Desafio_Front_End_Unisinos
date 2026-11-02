import React, { Component } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  listarDisciplinas,
  listarPrerequisitos,
  criarPrerequisito,
  atualizarPrerequisito,
  removerPrerequisito,
} from '../services/api';

const FORM_VAZIO = {
  disciplinaid: '',
  disciplina_exigidaid: '',
};

class PreRequisitos extends Component {
  constructor(props) {
    super(props);
    this.state = {
      disciplinas: [],
      prerequisitos: [],
      form: { ...FORM_VAZIO },
      prerequisitoidEdicao: null,
      erro: '',
      mensagem: '',
    };
  }

  componentDidMount() {
    this.carregar();
  }

  carregar = async () => {
    const { usuario } = this.context;

    try {
      const [disciplinas, prerequisitos] = await Promise.all([
        listarDisciplinas(usuario),
        listarPrerequisitos(usuario),
      ]);
      this.setState({ disciplinas, prerequisitos, erro: '' });
    } catch (err) {
      this.setState({ erro: err.message });
    }
  };

  handleChange = (event) => {
    this.setState({
      form: {
        ...this.state.form,
        [event.target.name]: event.target.value,
      },
      erro: '',
      mensagem: '',
    });
  };

  handleSubmit = async (event) => {
    event.preventDefault();
    const { usuario } = this.context;
    const { form, prerequisitoidEdicao } = this.state;
    const payload = {
      disciplinaid: Number(form.disciplinaid),
      disciplina_exigidaid: Number(form.disciplina_exigidaid),
    };

    try {
      if (prerequisitoidEdicao) {
        await atualizarPrerequisito(usuario, prerequisitoidEdicao, payload);
      } else {
        await criarPrerequisito(usuario, payload);
      }

      this.setState({
        form: { ...FORM_VAZIO },
        prerequisitoidEdicao: null,
        mensagem: prerequisitoidEdicao ? 'Pré-requisito atualizado.' : 'Pré-requisito criado.',
        erro: '',
      });
      await this.carregar();
    } catch (err) {
      this.setState({ erro: err.message, mensagem: '' });
    }
  };

  editar = (prerequisito) => {
    this.setState({
      prerequisitoidEdicao: prerequisito.prerequisitoid,
      form: {
        disciplinaid: String(prerequisito.disciplinaid),
        disciplina_exigidaid: String(prerequisito.disciplina_exigidaid),
      },
      erro: '',
      mensagem: '',
    });
  };

  cancelarEdicao = () => {
    this.setState({
      form: { ...FORM_VAZIO },
      prerequisitoidEdicao: null,
      erro: '',
      mensagem: '',
    });
  };

  remover = async (prerequisito) => {
    const confirmado = window.confirm(
      `Remover o pré-requisito ${prerequisito.disciplina_codigo} → ${prerequisito.exigida_codigo}?`
    );

    if (!confirmado) {
      return;
    }

    try {
      await removerPrerequisito(this.context.usuario, prerequisito.prerequisitoid);
      this.setState((state) => ({
        form: state.prerequisitoidEdicao === prerequisito.prerequisitoid ? { ...FORM_VAZIO } : state.form,
        prerequisitoidEdicao:
          state.prerequisitoidEdicao === prerequisito.prerequisitoid ? null : state.prerequisitoidEdicao,
        mensagem: 'Pré-requisito removido.',
        erro: '',
      }));
      await this.carregar();
    } catch (err) {
      this.setState({ erro: err.message, mensagem: '' });
    }
  };

  render() {
    const { telaAtual, setTela, logout } = this.context;
    const { disciplinas, prerequisitos, form, prerequisitoidEdicao, erro, mensagem } = this.state;

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
          <h1>Pré-requisitos</h1>

          <h2>{prerequisitoidEdicao ? 'Editar pré-requisito' : 'Novo pré-requisito'}</h2>
          <form onSubmit={this.handleSubmit}>
            <div className="mb-3">
              <label className="form-label" htmlFor="disciplinaid">
                Disciplina
              </label>
              <select
                className="form-select"
                id="disciplinaid"
                name="disciplinaid"
                value={form.disciplinaid}
                onChange={this.handleChange}
                required
              >
                <option value="">Selecione</option>
                {disciplinas.map((disciplina) => (
                  <option key={disciplina.disciplinaid} value={disciplina.disciplinaid}>
                    {disciplina.codigo} — {disciplina.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="disciplina_exigidaid">
                Disciplina exigida
              </label>
              <select
                className="form-select"
                id="disciplina_exigidaid"
                name="disciplina_exigidaid"
                value={form.disciplina_exigidaid}
                onChange={this.handleChange}
                required
              >
                <option value="">Selecione</option>
                {disciplinas.map((disciplina) => (
                  <option key={disciplina.disciplinaid} value={disciplina.disciplinaid}>
                    {disciplina.codigo} — {disciplina.nome}
                  </option>
                ))}
              </select>
            </div>

            <button className="btn btn-primary" type="submit">
              {prerequisitoidEdicao ? 'Salvar alterações' : 'Criar pré-requisito'}
            </button>
            {prerequisitoidEdicao && (
              <button className="btn btn-secondary ms-2" type="button" onClick={this.cancelarEdicao}>
                Cancelar edição
              </button>
            )}
          </form>

          {erro && <div className="alert alert-danger mt-3">{erro}</div>}
          {mensagem && <div className="alert alert-success mt-3">{mensagem}</div>}

          <h2 className="mt-4">Pré-requisitos cadastrados</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Disciplina</th>
                <th>Exige</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {prerequisitos.map((prerequisito) => (
                <tr key={prerequisito.prerequisitoid}>
                  <td>
                    {prerequisito.disciplina_codigo} — {prerequisito.disciplina_nome}
                  </td>
                  <td>
                    {prerequisito.exigida_codigo} — {prerequisito.exigida_nome}
                  </td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm me-2"
                      type="button"
                      onClick={() => this.editar(prerequisito)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      type="button"
                      onClick={() => this.remover(prerequisito)}
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
      </div>
    );
  }
}

PreRequisitos.contextType = AuthContext;

export default PreRequisitos;
