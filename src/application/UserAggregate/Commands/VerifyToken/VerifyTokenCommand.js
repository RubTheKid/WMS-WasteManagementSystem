export class VerifyTokenCommand {
  constructor(token) {
    this.validateToken(token);
    this.token = token;
  }

  validateToken(token) {
    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      throw new Error('Token is required');
    }
  }
}
