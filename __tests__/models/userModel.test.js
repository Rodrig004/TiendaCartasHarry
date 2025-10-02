const UserModel = require('../../models/userModel');

describe('UserModel', () => {
  // Limpiar datos antes de cada test
  beforeEach(() => {
    UserModel.users = [
      { id: 1, username: 'admin', password: 'admin123', role: 'admin' },
      { id: 2, username: 'cliente', password: 'cliente123', role: 'user' }
    ];
    UserModel.googleUsers = [];
  });

  describe('findByCredentials()', () => {
    test('debería encontrar usuario con credenciales válidas', () => {
      const user = UserModel.findByCredentials('admin', 'admin123');
      
      expect(user).toBeDefined();
      expect(user.id).toBe(1);
      expect(user.username).toBe('admin');
      expect(user.role).toBe('admin');
    });

    test('debería retornar undefined con credenciales inválidas', () => {
      const user = UserModel.findByCredentials('admin', 'password-incorrecta');
      
      expect(user).toBeUndefined();
    });

    test('debería retornar undefined para usuario inexistente', () => {
      const user = UserModel.findByCredentials('usuario-inexistente', 'admin123');
      
      expect(user).toBeUndefined();
    });
  });

  describe('createGoogleUser()', () => {
    test('debería crear un nuevo usuario de Google', () => {
      const googleUserData = {
        googleId: '123456789',
        username: 'Juan Google',
        email: 'juan@google.com',
        avatar: 'avatar.jpg'
      };

      const newUser = UserModel.createGoogleUser(googleUserData);
      
      expect(newUser).toBeDefined();
      expect(newUser.id).toBe(1000); // Primer usuario Google
      expect(newUser.googleId).toBe('123456789');
      expect(newUser.role).toBe('user'); // Rol por defecto
      expect(UserModel.googleUsers).toHaveLength(1);
    });

    test('debería incrementar el ID para cada nuevo usuario', () => {
      const user1 = UserModel.createGoogleUser({
        googleId: '111', username: 'User1', email: '1@test.com', avatar: '1.jpg'
      });
      
      const user2 = UserModel.createGoogleUser({
        googleId: '222', username: 'User2', email: '2@test.com', avatar: '2.jpg'
      });

      expect(user1.id).toBe(1000);
      expect(user2.id).toBe(1001);
    });
  });

  describe('findByGoogleId()', () => {
    test('debería encontrar usuario por Google ID', () => {
      // Primero crear un usuario
      UserModel.createGoogleUser({
        googleId: 'google123',
        username: 'Test Google',
        email: 'test@google.com',
        avatar: 'test.jpg'
      });

      const user = UserModel.findByGoogleId('google123');
      
      expect(user).toBeDefined();
      expect(user.googleId).toBe('google123');
    });

    test('debería retornar undefined para Google ID inexistente', () => {
      const user = UserModel.findByGoogleId('id-inexistente');
      
      expect(user).toBeUndefined();
    });
  });

  describe('findById()', () => {
    test('debería encontrar usuario tradicional por ID', () => {
      const user = UserModel.findById(1);
      
      expect(user).toBeDefined();
      expect(user.username).toBe('admin');
    });

    test('debería encontrar usuario Google por ID', () => {
      const googleUser = UserModel.createGoogleUser({
        googleId: 'google123', username: 'Google User', email: 'g@test.com', avatar: 'g.jpg'
      });

      const user = UserModel.findById(googleUser.id);
      
      expect(user).toBeDefined();
      expect(user.username).toBe('Google User');
    });

    test('debería retornar undefined para ID inexistente', () => {
      const user = UserModel.findById(9999);
      
      expect(user).toBeUndefined();
    });
  });
});