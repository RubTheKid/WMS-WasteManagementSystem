export class VerifyTokenResponse {
  constructor(success, message, user) {
    this.success = success;
    this.message = message;
    this.data = {
      user
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
