// routes/authRoutes.js 
const express = require('express'); 
const jwt = require('jsonwebtoken'); 
const { secret, expiresIn } = require('../config/jwtConfig'); 
const UserModel = require('../models/userModel'); 
const { passport, generateToken } = require('../config/passport');

const router = express.Router(); 

// Login tradicional
router.post('/login', (req, res) => { 
  const { username, password } = req.body; 
  const user = UserModel.findByCredentials(username, password); 
  if (!user) return res.status(401).json({ error: 'Credenciales inválidas' }); 
  
  const token = generateToken(user);
  res.json({ token, user: { id: user.id, username: user.username, role: user.role } }); 
});

// Rutas de Google OAuth
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    // Generar token JWT para el usuario de Google
    const token = generateToken(req.user);
    
    // Redirigir a la página principal con el token en query string
    res.redirect(`/?token=${token}`);
  }
);

// Ruta para obtener el perfil del usuario actual
router.get('/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) return res.status(401).json({ error: 'Token no proporcionado' });
  
  const [scheme, token] = authHeader.split(' ');
  
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Formato de autorización inválido' });
  }
  
  try {
    const decoded = jwt.verify(token, secret);
    const user = UserModel.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    // No devolver información sensible
    const userProfile = {
      id: user.id,
      username: user.username,
      role: user.role,
      email: user.email,
      avatar: user.avatar
    };
    
    res.json(userProfile);
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
});

module.exports = router;