const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const passport = require('passport')
const flash = require('connect-flash')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const morgan = require('morgan')
const localAuth = require('./localAuth')

module.exports = (app, db) => {
  /*
   * Setup view layer.
   */
  app.use(express.static(path.join(__dirname, '../public')))
  app.set('views', path.join(__dirname, '../views'))
  app.set('view engine', 'pug')

  /*
   * Setup required middleware.
   */
  app.use(morgan('tiny'))
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(cookieParser('keyboard cat'))
  app.use(session({ cookie: { maxAge: 60000 } }))
  app.use(flash())
  app.use(passport.initialize())
  app.use(passport.session())
  app.use((req, res, next) => {
    // Make user object available to templates. Also indicates if a user
    // is logged in.
    res.locals.user = req.user
    next()
  })
  passport.use(localAuth.strategy(db))
  passport.serializeUser(localAuth.serializeUser)
  passport.deserializeUser(localAuth.deserializeUser(db))
}
