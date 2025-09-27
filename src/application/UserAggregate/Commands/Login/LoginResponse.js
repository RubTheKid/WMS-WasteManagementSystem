export class LoginResponse {
  constructor(success, message, token, user) {
    this.success = success;
    this.message = message;
    this.data = {
      token
    };
  }

  toJSON() {
    return {
      success: this.success,
      message: this.message,
      data: this.data
    };
  }
}
