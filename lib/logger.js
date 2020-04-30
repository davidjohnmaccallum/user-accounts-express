const getenv = require('getenv')
const colors = require('colors')

module.exports = (filename) => {
  const log = (logFunction, color, message, optionalParams) => {
    console.log({ message, optionalParams })
    if (!optionalParams) {
      logFunction(color(filename), color(message))
    } else if (optionalParams.length === 1) {
      logFunction(color(filename), color(message), colors.grey(optionalParams[0]))
    } else {
      logFunction(color(filename), color(message), colors.grey(optionalParams))
    }
  }
  return {
    debug: (message, optionalParams) => {
      if (!getenv.boolish('DEBUG', false)) return
      log(console.debug, colors.blue, message, optionalParams)
    },
    info: (message, optionalParams) => {
      log(console.info, colors.black, message, optionalParams)
    },
    error: (message, optionalParams) => {
      log(console.error, colors.red, message, optionalParams)
    },
  }
}
