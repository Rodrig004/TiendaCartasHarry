require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const { productos } = require('./data.js');
const { passport } = require('./config/passport');

const app = express(); 

// Middlewares globales 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); 
app.set('view engine', 'ejs'); 
app.set('views', path.join(__dirname, 'views'));

// Configuración de sesiones
app.use(session({
  secret: 'clave_secreta_nfl_shop_1234',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Cambiar a true en producción con HTTPS
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Rutas API (login + carrito protegido) 
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');
app.use('/api', authRoutes);
app.use('/api', cartRoutes);

app.get('/login', (req, res) => { 
  res.render('login', { error: null });
});

// Página principal: renderiza productos 
app.get('/', (req, res) => { 
  // Verificar si hay token en query string (proveniente de Google OAuth)
  const token = req.query.token;
  if (token) {
    // Renderizar página con token disponible para el cliente
    return res.render('index', { productos, token });
  }
  res.render('index', { productos, token: null });
});

// Ruta de logout
app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/login');
  });
});

// Arranque
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`); 
});