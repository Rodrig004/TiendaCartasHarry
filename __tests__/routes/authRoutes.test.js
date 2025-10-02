// __tests__/routes/authRoutes.test.js
jest.mock('passport-google-oauth20', () => {
  return {
    Strategy: jest.fn().mockImplementation(() => {
      return {
        name: 'google',
        authenticate: jest.fn()
      };
    })
  };
});

jest.mock('../../config/passport', () => ({
  passport: {
    authenticate: jest.fn(() => (req, res, next) => next())
  },
  generateToken: jest.fn(() => 'mock-jwt-token')
}));

const request = require('supertest');
const express = require('express');
const authRoutes = require('../../routes/authRoutes');
const UserModel = require('../../models/userModel');

// Crear app de express para testing
const app = express();
app.use(express.json());
app.use('/api', authRoutes);

describe('Auth Routes', () => {
  beforeEach(() => {
    UserModel.users = [
      { id: 1, username: 'admin', password: 'admin123', role: 'admin' }
    ];
    UserModel.googleUsers = [];
  });

  describe('POST /api/login', () => {
    test('debería hacer login exitoso con credenciales válidas', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({ username: 'admin', password: 'admin123' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.username).toBe('admin');
    });

    test('debería fallar login con credenciales inválidas', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({ username: 'admin', password: 'wrong-password' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Credenciales inválidas');
    });

    test('debería fallar login sin password', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({ username: 'admin' });

      expect(response.status).toBe(401); // Express devuelve 401 por error interno
    });
  });

  describe('GET /api/profile', () => {
    test('debería retornar error sin token', async () => {
      const response = await request(app)
        .get('/api/profile');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Token no proporcionado');
    });
  });
});