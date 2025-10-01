// config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const UserModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { secret, expiresIn } = require('./jwtConfig');

// Configuración de la estrategia de Google
passport.use(new GoogleStrategy({
    clientID: process.env.client_ID,
    clientSecret: process.env.client_secret,
    callbackURL: "/api/auth/google/callback"  // Asegúrate que esta ruta coincide con tu server
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Perfil de Google recibido:', profile);
      
      // Buscar usuario existente o crear uno nuevo
      let user = await UserModel.findByGoogleId(profile.id);
      
      if (!user) {
        // Crear nuevo usuario con Google
        user = await UserModel.createGoogleUser({
          googleId: profile.id,
          username: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos[0].value
        });
        console.log('Nuevo usuario creado:', user);
      } else {
        console.log('Usuario existente encontrado:', user);
      }
      
      return done(null, user);
    } catch (error) {
      console.error('Error en Google Strategy:', error);
      return done(error, null);
    }
  }
));

// Serializar usuario para la sesión
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserializar usuario de la sesión
passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserModel.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Función para generar JWT
function generateToken(user) {
  const payload = { 
    id: user.id, 
    username: user.username, 
    role: user.role 
  };
  return jwt.sign(payload, secret, { expiresIn });
}

module.exports = { passport, generateToken };