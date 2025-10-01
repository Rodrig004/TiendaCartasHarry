// models/userModel.js
class UserModel {
  static users = [
    { id: 1, username: 'admin', password: 'admin123', role: 'admin' },
    { id: 2, username: 'cliente', password: 'cliente123', role: 'user' }
  ];

  static googleUsers = []; // Almacenar usuarios de Google en memoria

  static findByCredentials(username, password) {
    return this.users.find(u => u.username === username && u.password === password);
  }

  static findByGoogleId(googleId) {
    return this.googleUsers.find(u => u.googleId === googleId);
  }

  static findByEmail(email) {
    return this.googleUsers.find(u => u.email === email) || 
           this.users.find(u => u.username === email);
  }

  static findById(id) {
    return this.googleUsers.find(u => u.id === id) || 
           this.users.find(u => u.id === id);
  }

  static createGoogleUser(userData) {
    const newUser = {
      id: this.googleUsers.length + 1000, // IDs empezando desde 1000 para usuarios Google
      googleId: userData.googleId,
      username: userData.username,
      email: userData.email,
      avatar: userData.avatar,
      role: 'user' // Rol por defecto para usuarios de Google
    };
    
    this.googleUsers.push(newUser);
    return newUser;
  }
}

module.exports = UserModel;