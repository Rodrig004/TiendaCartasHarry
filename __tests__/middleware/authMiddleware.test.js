const authMiddleware = require('../../middlewares/authMiddleware');
const jwt = require('jsonwebtoken');
const { secret } = require('../../config/jwtConfig');

// Mock de console.log para no mostrar logs en tests
console.log = jest.fn();

describe('AuthMiddleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  describe('Token válido', () => {
    test('debería llamar next() con token válido', () => {
      const token = jwt.sign({ id: 1, username: 'admin', role: 'admin' }, secret);
      mockReq.headers.authorization = `Bearer ${token}`;

      authMiddleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toBeDefined();
      expect(mockReq.user.id).toBe(1);
    });
  });

  describe('Token inválido', () => {
    test('debería retornar 401 si no hay header authorization', () => {
      authMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Token no proporcionado' });
    });

    test('debería retornar 401 con formato de authorization inválido', () => {
      mockReq.headers.authorization = 'InvalidFormat token';

      authMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Formato de autorización inválido' });
    });

    test('debería retornar 401 con token expirado', () => {
      // Token expirado (usando un secret diferente para invalidar)
      const expiredToken = jwt.sign({ id: 1 }, 'wrong-secret');
      mockReq.headers.authorization = `Bearer ${expiredToken}`;

      authMiddleware(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Token inválido o expirado' });
    });
  });
});