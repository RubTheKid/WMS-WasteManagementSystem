import jwt from 'jsonwebtoken';
import { VerifyTokenResponse } from './VerifyTokenResponse.js';

export class VerifyTokenHandler {
  constructor(userRepository, jwtSecret) {
    this.userRepository = userRepository;
    this.jwtSecret = jwtSecret;
  }

  async handle(command) {
    try {
      const decoded = jwt.verify(command.token, this.jwtSecret);
      const user = await this.userRepository.findById(decoded.userId);

      if (!user) {
        throw new Error('Invalid token');
      }

      return new VerifyTokenResponse(
        true,
        'Token verified successfully',
        user.toSafeJSON()
      );
    } catch (error) {
      console.error('Error in VerifyTokenHandler:', error);
      
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw new Error('Invalid token');
      }
      
      throw error;
    }
  }
}
