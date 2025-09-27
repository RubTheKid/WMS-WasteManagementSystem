export class TriggerAnalysisResponse {
  constructor(message, timestamp) {
    this.message = message;
    this.timestamp = timestamp;
  }

  toJSON() {
    return {
      message: this.message,
      timestamp: this.timestamp
    };
  }
}
