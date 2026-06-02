// ===== Autenticação com JWT =====
import jwt from 'jsonwebtoken';

const SEGREDO = process.env.JWT_SECRET || 'troque-este-segredo';

// Gera o token a partir dos dados do usuário
export function gerarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, nivel: usuario.nivel, nome: usuario.nome },
    SEGREDO,
    { expiresIn: '8h' }
  );
}

// Middleware: exige um token válido. Coloca req.usuario.
export function autenticar(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) return res.status(401).json({ erro: 'Token não enviado.' });

  try {
    req.usuario = jwt.verify(token, SEGREDO);
    next();
  } catch {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
}

// Middleware: exige que o usuário tenha um dos níveis informados.
// Ex: exigirNivel('master')  ou  exigirNivel('master', 'adm')
export function exigirNivel(...niveis) {
  return (req, res, next) => {
    if (!req.usuario) return res.status(401).json({ erro: 'Não autenticado.' });
    if (!niveis.includes(req.usuario.nivel)) {
      return res.status(403).json({ erro: 'Você não tem permissão para isso.' });
    }
    next();
  };
}
