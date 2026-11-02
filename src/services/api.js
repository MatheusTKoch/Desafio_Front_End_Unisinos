const API_URL = 'http://localhost:3000';

export async function login(email, senha) {
  const response = await fetch(`${API_URL}/api/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, senha }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.erro || 'Erro ao fazer login');
  }

  return data;
}
