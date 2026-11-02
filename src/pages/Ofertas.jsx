import React, { Component } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  listarDisciplinas,
  listarProfessores,
  listarTurmas,
  criarTurma,
  atualizarTurma,
  removerTurma,
} from '../services/api';

const DIAS = [
  { valor: 2, nome: 'Segunda' },
  { valor: 3, nome: 'Terça' },
  { valor: 4, nome: 'Quarta' },
  { valor: 5, nome: 'Quinta' },
  { valor: 6, nome: 'Sexta' },
  { valor: 7, nome: 'Sábado' },
];

const TURNOS = [
  { valor: 1, nome: 'Manhã' },
  { valor: 2, nome: 'Tarde' },
  { valor: 3, nome: 'Noite' },
];

const FORM_VAZIO = {
  disciplinaid: '',
  professorid: '',
  dia_semana: '',
  turno: '',
  vagas: '',
};

function nomeDia(dia) {
  return DIAS.find((item) => item.valor === Number(dia))?.nome || dia;
}

function nomeTurno(turno) {
  return TURNOS.find((item) => item.valor === Number(turno))?.nome || turno;
}

class Ofertas extends Component {
  constructor(props) {
    super(props);
    this.state = {
      disciplinas: [],
      professores: [],
      turmas: [],
      form: { ...FORM_VAZIO },
      turmaidEdicao: null,
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
      const [disciplinas, professores, turmas] = await Promise.all([
        listarDisciplinas(usuario),
        listarProfessores(usuario),
        listarTurmas(usuario),
      ]);
      this.setState({ disciplinas, professores, turmas, erro: '' });
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
    const { form, turmaidEdicao } = this.state;
    const payload = {
      disciplinaid: Number(form.disciplinaid),
      professorid: Number(form.professorid),
      dia_semana: Number(form.dia_semana),
      turno: Number(form.turno),
      vagas: Number(form.vagas),
    };

    try {
      if (turmaidEdicao) {
        await atualizarTurma(usuario, turmaidEdicao, payload);
      } else {
        await criarTurma(usuario, payload);
      }

      this.setState({
        form: { ...FORM_VAZIO },
        turmaidEdicao: null,
        mensagem: turmaidEdicao ? 'Turma atualizada.' : 'Turma criada.',
        erro: '',
      });
      await this.carregar();
    } catch (err) {
      this.setState({ erro: err.message, mensagem: '' });
    }
  };

  editar = (turma) => {
    this.setState({
      turmaidEdicao: turma.turmaid,
      form: {
        disciplinaid: String(turma.disciplinaid),
        professorid: String(turma.professorid),
        dia_semana: String(turma.dia_semana),
        turno: String(turma.turno),
        vagas: String(turma.vagas),
      },
      erro: '',
      mensagem: '',
    });
  };

  cancelarEdicao = () => {
    this.setState({
      form: { ...FORM_VAZIO },
      turmaidEdicao: null,
      erro: '',
      mensagem: '',
    });
  };

  remover = async (turma) => {
    const confirmado = window.confirm(
      `Remover a turma ${turma.disciplina_codigo} (${turma.codigo_horario})?`
    );

    if (!confirmado) {
      return;
    }

    try {
      await removerTurma(this.context.usuario, turma.turmaid);
      this.setState((state) => ({
        form: state.turmaidEdicao === turma.turmaid ? { ...FORM_VAZIO } : state.form,
        turmaidEdicao: state.turmaidEdicao === turma.turmaid ? null : state.turmaidEdicao,
        mensagem: 'Turma removida.',
        erro: '',
      }));
      await this.carregar();
    } catch (err) {
      this.setState({ erro: err.message, mensagem: '' });
    }
  };

  render() {
    const { setTela } = this.context;
    const { disciplinas, professores, turmas, form, turmaidEdicao, erro, mensagem } = this.state;
    const codigo = form.dia_semana && form.turno ? `${form.dia_semana}${form.turno}` : '';

    return (
      <div>
        <h1>Ofertas de turmas</h1>
        <button type="button" onClick={() => setTela('instituicao')}>
          Voltar
        </button>

        <h2>{turmaidEdicao ? 'Editar turma' : 'Nova turma'}</h2>
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
            <label htmlFor="professorid">Professor</label>
            <br />
            <select
              id="professorid"
              name="professorid"
              value={form.professorid}
              onChange={this.handleChange}
              required
            >
              <option value="">Selecione</option>
              {professores.map((professor) => (
                <option key={professor.professorid} value={professor.professorid}>
                  {professor.nome}
                </option>
              ))}
            </select>
          </div>

          <br />

          <div>
            <label htmlFor="dia_semana">Dia</label>
            <br />
            <select
              id="dia_semana"
              name="dia_semana"
              value={form.dia_semana}
              onChange={this.handleChange}
              required
            >
              <option value="">Selecione</option>
              {DIAS.map((dia) => (
                <option key={dia.valor} value={dia.valor}>
                  {dia.nome}
                </option>
              ))}
            </select>
          </div>

          <br />

          <div>
            <label htmlFor="turno">Turno</label>
            <br />
            <select
              id="turno"
              name="turno"
              value={form.turno}
              onChange={this.handleChange}
              required
            >
              <option value="">Selecione</option>
              {TURNOS.map((turno) => (
                <option key={turno.valor} value={turno.valor}>
                  {turno.nome}
                </option>
              ))}
            </select>
          </div>

          <br />

          <div>
            <label htmlFor="vagas">Vagas</label>
            <br />
            <input
              id="vagas"
              type="number"
              name="vagas"
              min="1"
              value={form.vagas}
              onChange={this.handleChange}
              required
            />
          </div>

          {codigo && <p>Código do horário: {codigo}</p>}

          <button type="submit">{turmaidEdicao ? 'Salvar alterações' : 'Criar turma'}</button>
          {turmaidEdicao && (
            <button type="button" onClick={this.cancelarEdicao}>
              Cancelar edição
            </button>
          )}
        </form>

        {erro && <p>{erro}</p>}
        {mensagem && <p>{mensagem}</p>}

        <h2>Turmas ofertadas</h2>
        <table>
          <thead>
            <tr>
              <th>Disciplina</th>
              <th>Professor</th>
              <th>Horário</th>
              <th>Vagas</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {turmas.map((turma) => (
              <tr key={turma.turmaid}>
                <td>
                  {turma.disciplina_codigo} — {turma.disciplina_nome}
                </td>
                <td>{turma.professor_nome}</td>
                <td>
                  {turma.codigo_horario} ({nomeDia(turma.dia_semana)} / {nomeTurno(turma.turno)})
                </td>
                <td>
                  {turma.vagas_ocupadas}/{turma.vagas}
                </td>
                <td>
                  <button type="button" onClick={() => this.editar(turma)}>
                    Editar
                  </button>
                  <button type="button" onClick={() => this.remover(turma)}>
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

Ofertas.contextType = AuthContext;

export default Ofertas;
