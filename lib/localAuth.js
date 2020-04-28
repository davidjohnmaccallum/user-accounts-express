const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const ObjectID = require('mongodb').ObjectID
const logger = require('./logger')

/**
 * This strategy tells Passport how to authenticate a user with a email
 * and password against a local user database (ie one that we own). It uses
 * bcrypt for password hashing.
 */
const strategy = (db) => {
  logger.debug('Creating strategy')
  return new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    logger.debug('LocalStrategy', email)

    if (!email || !password) {
      return done(null, false, { message: 'Incorrect email address or password.' })
    }

    const users = db.collection('users')

    users.findOne({ email }, (error, user) => {
      logger.debug('LocalStrategy', 'user.findOne', { error, user })
      if (error) {
        return done(error)
      }
      if (!user) {
        return done(null, false, { message: 'Incorrect email address or password.' })
      }
      bcrypt.compare(password, user.passwordHash, (error, passwordsMatch) => {
        if (error) {
          return done(error)
        }
        if (!passwordsMatch) {
          return done(null, false, { message: 'Incorrect email address or password.' })
        }
        return done(null, user)
      })
    })
  })
}

/**
 * This function tells Passport how to store the user
 * in the session cookie.
 */
const serializeUser = (user, done) => {
  logger.debug('serializeUser', user)
  done(null, user._id.toString())
}

/**
 * This function tells Passport how to retrieve the user
 * from the session cookie.
 */
const deserializeUser = (db) => (id, done) => {
  logger.debug('deserializeUser', id)
  const users = db.collection('users')
  users.findOne(new ObjectID(id), (error, user) => {
    logger.debug('deserializeUser', 'user.findOne', { error, user })
    done(error, user)
  })
}

module.exports = {
  strategy,
  serializeUser,
  deserializeUser,
}
