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
    const { setTela } = this.context;
    const { disciplinas, prerequisitos, form, prerequisitoidEdicao, erro, mensagem } = this.state;

    return (
      <div>
        <h1>Pré-requisitos</h1>
        <button type="button" onClick={() => setTela('instituicao')}>
          Voltar
        </button>

        <h2>{prerequisitoidEdicao ? 'Editar pré-requisito' : 'Novo pré-requisito'}</h2>
        <form onSubmit={this.handleSubmit}>
          <div>
            <label htmlFor="disciplinaid">Disciplina</label>
            <br />
            <select
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

          <br />

          <div>
            <label htmlFor="disciplina_exigidaid">Disciplina exigida</label>
            <br />
            <select
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

          <br />

          <button type="submit">
            {prerequisitoidEdicao ? 'Salvar alterações' : 'Criar pré-requisito'}
          </button>
          {prerequisitoidEdicao && (
            <button type="button" onClick={this.cancelarEdicao}>
              Cancelar edição
            </button>
          )}
        </form>

        {erro && <p>{erro}</p>}
        {mensagem && <p>{mensagem}</p>}

        <h2>Pré-requisitos cadastrados</h2>
        <table>
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
                  <button type="button" onClick={() => this.editar(prerequisito)}>
                    Editar
                  </button>
                  <button type="button" onClick={() => this.remover(prerequisito)}>
                    Remover
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

PreRequisitos.contextType = AuthContext;

export default PreRequisitos;
