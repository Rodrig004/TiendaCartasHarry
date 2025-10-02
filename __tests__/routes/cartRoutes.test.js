const request = require('supertest');
const express = require('express');
const cartRoutes = require('../../routes/cartRoutes');
const UserModel = require('../../models/userModel');
const { productos } = require('../../data');
const jwt = require('jsonwebtoken');
const { secret } = require('../../config/jwtConfig');

const app = express();
app.use(express.json());
app.use('/api', cartRoutes);

describe('Cart Routes', () => {
  let validToken;

  beforeEach(() => {
    // Resetear datos
    UserModel.users = [
      { id: 1, username: 'testuser', password: 'testpass', role: 'user' }
    ];
    
    // Restaurar stock de productos
    productos.forEach(p => {
      p.stock = 10; // Stock inicial
    });

    // Crear token válido
    validToken = jwt.sign({ id: 1, username: 'testuser', role: 'user' }, secret);
  });

  describe('GET /api/carrito', () => {
    test('debería retornar carrito vacío para usuario nuevo', async () => {
      const response = await request(app)
        .get('/api/carrito')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.cart).toEqual([]);
      expect(response.body.items).toBe(0);
      expect(response.body.subtotal).toBe(0);
    });
  });

  describe('POST /api/carrito/add', () => {
    test('debería agregar producto al carrito', async () => {
      const response = await request(app)
        .post('/api/carrito/add')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ id: 1, cantidad: 2 });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Producto agregado');
      expect(response.body.cart).toHaveLength(1);
      expect(response.body.cart[0].id).toBe(1);
      expect(response.body.cart[0].cantidad).toBe(2);
    });

    test('debería fallar con cantidad inválida', async () => {
      const response = await request(app)
        .post('/api/carrito/add')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ id: 1, cantidad: -1 });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Datos inválidos');
    });

    test('debería fallar con producto inexistente', async () => {
      const response = await request(app)
        .post('/api/carrito/add')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ id: 999, cantidad: 1 });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Producto no encontrado');
    });
  });
});