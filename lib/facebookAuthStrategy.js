const FacebookStrategy = require('passport-facebook').Strategy
const getenv = require('getenv')
const handleOAuthCallback = require('./handleOAuthCallback')
const validator = require('validator')
const normalizeEmailOptions = require('./normalizeEmailOptions')

module.exports = (db) =>
  new FacebookStrategy(
    {
      clientID: getenv('FACEBOOK_OAUTH_APP_ID'),
      clientSecret: getenv('FACEBOOK_OAUTH_APP_SECRET'),
      callbackURL: getenv('APP_HOST', 'http://localhost:3000') + '/users/auth/facebook/callback',
      profileFields: ['id', 'displayName', 'photos', 'email'],
    },
    handleOAuthCallback(db, mapToUser)
  )

/**
 * Map the users Facebook profile to our User object.
 *
 * @param {*} profile The users Facebook profile
 * @returns A user object we can store in the database.
 */
const mapToUser = (profile) => ({
  email: validator.normalizeEmail(profile._json.email, normalizeEmailOptions),
  fullName: profile._json.name,
  picture: profile._json.picture && profile._json.picture.data && profile._json.picture.data.url,
  emailVerified: true,
  provider: 'facebook',
  providerProfile: profile._json,
})
