// middlewares/authMiddleware.js 

const jwt = require('jsonwebtoken');
const { secret } = require('../config/jwtConfig');

const authMiddleware = (req, res, next) => { 
  
  const authHeader = req.headers.authorization; 
  
  if (!authHeader) return res.status(401).json({ error: 'Token no proporcionado' }); 
  
  const [scheme, token] = authHeader.split(' '); 
  
  if (scheme !== 'Bearer' || !token) { 
    return res.status(401).json({ error: 'Formato de autorización inválido' }); } 
    
    try { 
      const decoded = jwt.verify(token, secret); 
      req.user = decoded; // { id, username, role } 
      next(); 
    } catch { 
      return res.status(401).json({ error: 'Token inválido o expirado' }); 
    
    } 
  }; 
  
  module.exports = authMiddleware;