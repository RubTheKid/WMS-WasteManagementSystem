export class LoginCommand {
  constructor(email, password) {
    this.validateEmail(email);
    this.validatePassword(password);
    this.email = email.toLowerCase().trim();
    this.password = password;
  }

  validateEmail(email) {
    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      throw new Error('Email is required');
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
  }

  validatePassword(password) {
    if (!password || typeof password !== 'string' || password.length === 0) {
      throw new Error('Password is required');
    }
  }
}
 