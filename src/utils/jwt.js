"use strict";

const jwt = require("jsonwebtoken");

/**
 * The default expiry time for JWT.
 * @constant
 * @type {number}
 * @default
 */
const EXPIRY_TIME = 6 * 60 * 60;

/**
 * Generates a JWT for the payload with a given expiry time.
 * @module generateToken
 * @param {string|object} payload The payload for which the JWT is to be
 * generated.
 * @param {number|string} expiryTime The expiry time for the JWT (in seconds) or
 * a timestamp (represented using string).
 * @returns {Promise<string>} The generated JWT
 */
const generateToken = (payload, expiryTime = EXPIRY_TIME) => {
  return new Promise(async (resolve, reject) => {
    try {
      let token;

      if (typeof payload === "object") {
        token = await jwt.sign(payload, process.env.HMAC_SECRET_KEY,
          { expiresIn: expiryTime }
        );
      } else if (typeof payload === "string") {
        // String payloads doesn't support `exp`. Why?
        token = await jwt.sign(payload, process.env.HMAC_SECRET_KEY);
      }

      resolve(token);
    } catch (e) {
      reject(e);
    }
  });
};

/**
 * Verifies JWT for authenticity
 * @module verifyToken
 * @param {string} token The JWT to be authenticated
 * @returns {Promise<string|object>} The decoded payload
 */
const verifyToken = (token) => {
  return new Promise(async (resolve, reject) => {
    try {
      let payload = await jwt.verify(token, process.env.HMAC_SECRET_KEY);

      resolve(payload);
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  generateToken,
  verifyToken,
};
