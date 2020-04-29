const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
const getenv = require('getenv')
const logger = require('./logger')
const validator = require('validator')
const normalizeEmailOptions = require('./normalizeEmailOptions')

// Use the GoogleStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.

module.exports = (db) =>
  new GoogleStrategy(
    {
      clientID: getenv('GOOGLE_OAUTH_CLIENT_ID'),
      clientSecret: getenv('GOOGLE_OAUTH_CLIENT_SECRET'),
      callbackURL: getenv('GOOGLE_OAUTH_CALLBACK_URL'),
    },
    function (accessToken, refreshToken, profile, done) {
      logger.debug('GoogleStrategy callback', JSON.stringify(profile, null, 4))

      // Normalize the email address
      const googleProfile = profile._json
      const normalizedEmail = validator.normalizeEmail(googleProfile.email, normalizeEmailOptions)

      // Search for user by email address
      const users = db.collection('users')
      users.findOne({ email: normalizedEmail }, (error, foundUser) => {
        if (error) return done(error)

        if (foundUser) {
          // If this is an existing user then update the user in the database
          const updatedUser = {
            ...foundUser,
            fullName: googleProfile.name,
            picture: googleProfile.picture,
            emailVerified: googleProfile.email_verified,
            provider: 'google',
            googleProfile,
          }
          users.replaceOne({ email: normalizedEmail }, updatedUser, (error) => {
            if (error) return done(error)
            return done(null, updatedUser)
          })
        } else {
          // If this a new user then insert a new user into the database
          const newUser = {
            email: normalizedEmail,
            fullName: googleProfile.name,
            picture: googleProfile.picture,
            emailVerified: googleProfile.email_verified,
            provider: 'google',
            googleProfile,
            roles: ['user'],
          }
          users.insertOne(newUser, (error, insertResult) => {
            if (error) return done(error)
            newUser._id = insertResult.insertedId
            return done(null, newUser)
          })
        }
      })
    }
  )
