const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const logger = require('./logger')(__filename)

/**
 * This strategy tells Passport how to authenticate a user with a email
 * and password against a local user database (ie one that we own). It uses
 * bcrypt for password hashing.
 */
module.exports = (db) =>
  new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    if (!email || !password) {
      logger.debug('Email address and/or password was null')
      return done(null, false, { message: 'Incorrect email address or password.' })
    }

    const users = db.collection('users')

    users.findOne({ email }, (error, user) => {
      if (error) {
        return done(error)
      }
      if (!user) {
        logger.debug('User not found', email)
        return done(null, false, { message: 'Incorrect email address or password.' })
      }
      logger.debug('User found', user)
      if (!user.passwordHash) {
        logger.debug('User does not have a password', user)
        return done(null, false, {
          message: `Please login using the ${capitalizeFirstLetter(user.provider)} button above.`,
        })
      }
      bcrypt.compare(password, user.passwordHash, (error, passwordsMatch) => {
        if (error) {
          return done(error)
        }
        if (!passwordsMatch) {
          logger.debug('Password mismatch', email)
          return done(null, false, { message: 'Incorrect email address or password.' })
        }
        logger.debug('Authentication successful', email)
        return done(null, user)
      })
    })
  })

function capitalizeFirstLetter(string) {
  if (!string) return
  if (!string.length > 0) return
  return string.charAt(0).toUpperCase() + string.slice(1)
}
