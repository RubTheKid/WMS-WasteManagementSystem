import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { LoginResponse } from './LoginResponse.js';

export class LoginHandler {
  constructor(userRepository, jwtSecret, jwtExpiresIn) {
    this.userRepository = userRepository;
    this.jwtSecret = jwtSecret;
    this.jwtExpiresIn = jwtExpiresIn;
  }

  async handle(command) {
    try {
      const user = await this.userRepository.findByEmail(command.email);
      
      if (!user) { 
        throw new Error('Invalid email or password');
      }

      const isPasswordValid = await bcrypt.compare(command.password, user.passwordHash);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role
        },
        this.jwtSecret,
        { expiresIn: this.jwtExpiresIn }
      );

      return new LoginResponse(
        true,
        'Login successful',
        token
      );
    } catch (error) {
      console.error('Error in LoginHandler:', error);
      throw error;
    }
  }
}
