// Middleware simples para checar o papel do usuário nas rotas futuras.
// O front envia o header x-usuario-tipo após o login.
export function requerTipo(...tiposPermitidos) {
  return (req, res, next) => {
    const tipo = req.headers['x-usuario-tipo'];

    if (!tipo) {
      return res.status(401).json({ erro: 'Tipo de usuário não informado' });
    }

    if (!tiposPermitidos.includes(tipo)) {
      return res.status(403).json({ erro: 'Acesso negado para este papel' });
    }

    next();
  };
}
