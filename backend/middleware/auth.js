// Middleware simples para checar o papel do usuário.
// O front envia x-usuario-tipo e, quando precisa, x-usuario-id.
export function requerTipo(...tiposPermitidos) {
  return (req, res, next) => {
    const tipo = req.headers['x-usuario-tipo'];

    if (!tipo) {
      return res.status(401).json({ erro: 'Tipo de usuário não informado' });
    }

    if (!tiposPermitidos.includes(tipo)) {
      return res.status(403).json({ erro: 'Acesso negado para este papel' });
    }

    const usuarioIdHeader = req.headers['x-usuario-id'];

    if (usuarioIdHeader !== undefined && usuarioIdHeader !== '') {
      const usuarioid = Number(usuarioIdHeader);

      if (!Number.isInteger(usuarioid) || usuarioid <= 0) {
        return res.status(400).json({ erro: 'Identificador de usuário inválido' });
      }

      req.usuarioid = usuarioid;
    }

    next();
  };
}
