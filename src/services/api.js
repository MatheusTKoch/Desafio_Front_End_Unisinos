const API_URL = 'http://localhost:3000';

function headers(usuario) {
  return {
    'Content-Type': 'application/json',
    'x-usuario-tipo': usuario.tipo,
    'x-usuario-id': String(usuario.usuarioid),
  };
}

async function request(path, options) {
  const response = await fetch(`${API_URL}${path}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.erro || 'Erro na requisição');
  }

  return data;
}

export async function login(email, senha) {
  return request('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, senha }),
  });
}

export function listarDisciplinas(usuario) {
  return request('/api/disciplinas', { headers: headers(usuario) });
}

export function listarProfessores(usuario) {
  return request('/api/professores', { headers: headers(usuario) });
}

export function listarTurmas(usuario) {
  return request('/api/turmas', { headers: headers(usuario) });
}

export function criarTurma(usuario, turma) {
  return request('/api/turmas', {
    method: 'POST',
    headers: headers(usuario),
    body: JSON.stringify(turma),
  });
}

export function atualizarTurma(usuario, turmaid, turma) {
  return request(`/api/turmas/${turmaid}`, {
    method: 'PUT',
    headers: headers(usuario),
    body: JSON.stringify(turma),
  });
}

export function removerTurma(usuario, turmaid) {
  return request(`/api/turmas/${turmaid}`, {
    method: 'DELETE',
    headers: headers(usuario),
  });
}

export function matricular(usuario, turmaid) {
  return request('/api/matriculas', {
    method: 'POST',
    headers: headers(usuario),
    body: JSON.stringify({ turmaid }),
  });
}
