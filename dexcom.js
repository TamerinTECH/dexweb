// dexcom.js
require('dotenv').config(); // only needed if you use a .env file for credentials
const axios = require('axios');
const {
  BASE_URLS,
  APPLICATION_IDS,
  ENDPOINTS,
  MAX_MINUTES,
  MAX_MAX_COUNT,
  MMOL_L_CONVERSION_FACTOR,
} = require('./constants');

class Dexcom {
  /**
   * Constructor for Dexcom client.
   * Options: username (or accountId) and password, and optionally region (default: 'us').
   */
  constructor({ username = null, accountId = null, password, region = 'eu' }) {
    if (!password) {
      throw new Error("Password is required.");
    }
    if (!username && !accountId) {
      throw new Error("Provide either a username or an accountId.");
    }
    if (username && accountId) {
      throw new Error("Provide only one: either username or accountId.");
    }

    this.username = username;
    this.accountId = accountId;
    this.password = password;
    this.region = region;

    this.baseUrl = BASE_URLS[region];
    this.applicationId = APPLICATION_IDS[region];
    this.sessionId = null;
  }

  async _post(endpoint, params = {}, data = {}) {
    try {
      const response = await axios.post(`${this.baseUrl}/${endpoint}`, data, {
        params,
        headers: { 'Accept-Encoding': 'application/json' },
      });
      return response.data;
    } catch (error) {
        console.error(error);
      // You can add error handling that inspects error.response.data for API error codes.
      throw new Error(`Failed to post to ${endpoint}: ${error.message}`);
    }
  }

  async createSession() {

    //TODO - handle errors - error 500 might be also wrong credentials
/*
response.data: {Code: 'AccountPasswordInvalid', Message: 'Publisher account password failed', SubCode: '<OnlineException DateThrownLocal="2025-04-13…ption: Publisher account password failed" />', TypeName: 'FaultException'}
*/
    
    // If accountId is not provided, fetch it using the username and password.
    if (!this.accountId && this.username) {
      // Authenticate to receive the account ID.
      const authResponse = await this._post(ENDPOINTS.AUTHENTICATE, {}, {
        accountName: this.username,
        password: this.password,
        applicationId: this.applicationId,
      });
      // The API returns the accountId directly.
      this.accountId = authResponse;
    }

    // Then get the session ID.
    const sessionResponse = await this._post(ENDPOINTS.LOGIN, {}, {
      accountId: this.accountId,
      password: this.password,
      applicationId: this.applicationId,
    });

    this.sessionId = sessionResponse;
  }

  /**
   * Retrieves glucose readings.
   * @param {number} minutes - Number of minutes back to retrieve readings (default: 1440).
   * @param {number} maxCount - Maximum number of readings to retrieve (default: 288).
   */
  async getGlucoseReadings(minutes = MAX_MINUTES, maxCount = MAX_MAX_COUNT) {
    if (!this.sessionId) {
      await this.createSession();
    }

    // Call Dexcom glucose endpoint.
    const readings = await this._post(ENDPOINTS.GLUCOSE, {
      sessionId: this.sessionId,
      minutes,
      maxCount,
    });
    return readings;
  }

  /**
   * Retrieves the most recent available glucose reading.
   * Uses 10 minutes window and returns the first reading.
   */
  async getCurrentGlucoseReading() {
    const readings = await this.getGlucoseReadings(10, 1);
    return readings && readings.length ? readings[0] : null;
  }
}

/**
 * Optionally define helper functions to parse the reading.
 * For example, converting mg/dL to mmol/L and interpreting trend.
 */
function parseGlucoseReading(json) {
  // In the Dexcom JSON, keys are similar to:
  // { "DT": "Date(1691455258000-0400)", "Value": 85, "Trend": "Flat", ... }
  if (!json || typeof json.Value !== "number") {
    throw new Error("Invalid glucose reading format.");
  }
  const value = json.Value;
  // Convert mg/dL to mmol/L:
  const mmolL = Math.round(value * MMOL_L_CONVERSION_FACTOR * 10) / 10;

  // You may want to expand the conversion for trend direction or description.
  return {
    mg_dL: value,
    mmol_L: mmolL,
    raw: json,
  };
}

module.exports = { Dexcom, parseGlucoseReading };
