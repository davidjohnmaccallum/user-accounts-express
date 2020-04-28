const getenv = require('getenv')

module.exports = {
  debug: getenv.boolish('DEBUG', false) ? console.debug : () => {},
  info: console.info,
  error: console.error,
}
