export class RateLimitManager {
  constructor(maxCallsPerSecond = 100) {
    this.maxCallsPerSecond = maxCallsPerSecond;
    this.apiCallTimestamps = [];
  }

  async rateLimitApiCall() {
    const now = Date.now();
    this.apiCallTimestamps = this.apiCallTimestamps.filter(
      timestamp => now - timestamp < 1000
    );
    
    // if at rate limit, wait
    if (this.apiCallTimestamps.length >= this.maxCallsPerSecond) {
      const oldestTimestamp = Math.min(...this.apiCallTimestamps);
      const waitTime = 1000 - (now - oldestTimestamp);
      
      if (waitTime > 0) {
        console.log(`Rate limiting: waiting ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return this.rateLimitApiCall();
      }
    }
    
    this.apiCallTimestamps.push(now);
  }

  getRateLimitStats() {
    const now = Date.now();
    const recentCalls = this.apiCallTimestamps.filter(
      timestamp => now - timestamp < 1000
    );
    
    return {
      currentCallsPerSecond: recentCalls.length,
      maxCallsPerSecond: this.maxCallsPerSecond,
      availableSlots: this.maxCallsPerSecond - recentCalls.length,
      nextSlotAvailable: recentCalls.length >= this.maxCallsPerSecond 
        ? Math.min(...recentCalls) + 1000 - now
        : 0
    };
  }

  reset() {
    this.apiCallTimestamps = [];
  }
}
