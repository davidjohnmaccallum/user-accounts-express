const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
const getenv = require('getenv')
const handleOAuthCallback = require('./handleOAuthCallback')
const validator = require('validator')
const normalizeEmailOptions = require('./normalizeEmailOptions')
const logger = require('./logger')(__filename)

module.exports = (db) =>
  new GoogleStrategy(
    {
      clientID: getenv('GOOGLE_OAUTH_CLIENT_ID'),
      clientSecret: getenv('GOOGLE_OAUTH_CLIENT_SECRET'),
      callbackURL: getenv('APP_HOST', 'http://localhost:3000') + '/users/auth/google/callback',
    },
    handleOAuthCallback(db, mapToUser)
  )

/**
 * Map the users Google profile to our User object.
 *
 * @param {*} profile The users Google profile
 * @returns A user object we can store in the database.
 */
const mapToUser = (profile) => ({
  email: validator.normalizeEmail(profile._json.email, normalizeEmailOptions),
  fullName: profile._json.name,
  picture: profile._json.picture,
  emailVerified: profile._json.email_verified,
  provider: 'google',
  providerProfile: profile._json,
})
