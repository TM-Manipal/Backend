"use strict";

const bcrypt = require("bcrypt");

/**
 * bcrypt will go through 2^SALT_ROUNDS iterations to hash the password.
 * @constant
 * @type {number}
*/
const SALT_ROUNDS = 10;

/**
 * Generates a salted hash for given plain text password.
 * @module generatePasswordHash
 * @param {string} password The plain text password.
 * @returns {Promise<string>} The salted hash of the given password.
 */
function generatePasswordHash(password) {
  return new Promise(async (resolve, reject) => {
    try {
      let hash = await bcrypt.hash(password, SALT_ROUNDS);
      resolve(hash);
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Generates a salted hash for given plain text password.
 * @module generatePasswordHash
 * @param {string} password The plain text password.
 * @param {string} hash The salted hash for the password
 * @returns {Promise<boolean>} Whether or not the given hash is of the password.
 */
function comparePasswordHash(password, hash) {
  return new Promise(async (resolve, reject) => {
    try {
      let match = await bcrypt.compare(password, hash);
      resolve(match);
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = {
  generatePasswordHash,
  comparePasswordHash,
};
