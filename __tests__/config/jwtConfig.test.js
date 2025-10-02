const jwtConfig = require('../../config/jwtConfig');

describe('JWT Config', () => {
  test('debería tener las propiedades correctas', () => {
    expect(jwtConfig).toHaveProperty('secret');
    expect(jwtConfig).toHaveProperty('expiresIn');
    expect(typeof jwtConfig.secret).toBe('string');
    expect(typeof jwtConfig.expiresIn).toBe('string');
  });

  test('debería tener un secret definido', () => {
    expect(jwtConfig.secret).toBeTruthy();
    expect(jwtConfig.secret.length).toBeGreaterThan(0);
  });

  test('debería tener un tiempo de expiración válido', () => {
    expect(jwtConfig.expiresIn).toBe('1h');
  });
});