"use strict";

const createError = require("http-errors");

module.exports = (_req, _res, next) => {
  next(createError(404));
};
