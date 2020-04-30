const logger = require('./logger')(__filename)

module.exports = (db, mapToUser) =>
  function (accessToken, refreshToken, profile, done) {
    const user = mapToUser(profile)
    logger.debug('Mapping to user', { profile, user })

    // Search for user by email address
    const users = db.collection('users')
    users.findOne({ email: user.email }, (error, foundUser) => {
      if (error) return done(error)

      if (foundUser) {
        // If this is an existing user then update the user in the database (her facebook profile might have changed)
        const updatedUser = {
          ...foundUser,
          ...user,
        }
        users.replaceOne({ _id: foundUser._id }, updatedUser, (error) => {
          if (error) return done(error)
          logger.info('Updated returning user', updatedUser)
          return done(null, updatedUser)
        })
      } else {
        // If this a new user then insert a new user into the database
        const newUser = {
          ...user,
          roles: ['user'],
        }
        users.insertOne(newUser, (error, insertResult) => {
          if (error) return done(error)
          newUser._id = insertResult.insertedId
          logger.info('Created new user', newUser)
          return done(null, newUser)
        })
      }
    })
  }
