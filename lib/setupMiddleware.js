const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const passport = require('passport')
const flash = require('connect-flash')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const morgan = require('morgan')
const localAuthStrategy = require('./localAuthStrategy')
const googleAuthStrategy = require('./googleAuthStrategy')
const logger = require('./logger')
const ObjectID = require('mongodb').ObjectID

module.exports = (app, db) => {
  /*
   * Setup view layer.
   */
  app.use(express.static(path.join(__dirname, '../public')))
  app.set('views', path.join(__dirname, '../views'))
  app.set('view engine', 'pug')

  /*
   * Setup general middleware.
   */
  app.use(morgan('tiny'))
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(cookieParser('keyboard cat'))
  app.use(session({ cookie: { maxAge: 60000 } }))
  app.use(flash())

  /*
   * Setup authentication middleware
   */
  app.use(passport.initialize())
  app.use(passport.session())
  app.use((req, res, next) => {
    // Make user object available to templates. Also indicates if a user
    // is logged in.
    res.locals.user = req.user
    next()
  })
  passport.use(localAuthStrategy(db))
  passport.use(googleAuthStrategy(db))
  /**
   * This function tells Passport how to store the user
   * in the session cookie.
   */
  passport.serializeUser((user, done) => {
    logger.debug('serializeUser', user)
    done(null, user?._id?.toString())
  })
  /**
   * This function tells Passport how to retrieve the user
   * from the session cookie.
   */
  passport.deserializeUser((id, done) => {
    logger.debug('deserializeUser', id)
    const users = db.collection('users')
    users.findOne(new ObjectID(id), (error, user) => {
      logger.debug('deserializeUser', 'user.findOne', { error, user })
      done(error, user)
    })
  })
}
