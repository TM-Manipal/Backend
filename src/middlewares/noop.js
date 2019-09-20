"use strict";

module.exports = (_req, _res, next) => {
  // eslint-disable-next-line no-console
  console.log("noop");
  next();
};
