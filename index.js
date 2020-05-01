const express = require('express')
const getenv = require('getenv')
const logger = require('./lib/logger')(__filename)
const app = express()
const connectDb = require('./lib/connectDb')
const guard = require('./lib/routeGuard')
const errorHandler = require('./lib/errorHandler')
const path = require('path')
const bodyParser = require('body-parser')
const passport = require('passport')
const ObjectID = require('mongodb').ObjectID

connectDb((error, db) => {
  if (error) return logger.error('Error connecting to DB', error)

  /*
   * Setup middleware
   */

  app.use((req, res, next) => {
    // Make db connection available to route scripts.
    req.db = db
    next()
  })
  setupViewLayerMiddleware()
  setupGeneralMiddleware()
  setupAuthMiddleware(db)

  /*
   * Application controllers
   */

  app.use('/', require('./routes/index'))
  app.use('/users', require('./routes/users'))

  app.get('/protected', guard.private, guard.role('user'), (req, res) =>
    res.render('pages/protected')
  )

  /*
   * Error handlers
   */

  app.use(errorHandler.handle404)
  app.use(errorHandler.handleAll)

  /**
   * Start server
   */

  const port = getenv.int('PORT', 3000)
  app.listen(port, () => logger.info(`Listening on port ${port}.`))
})

/**
 * Configure template engine and static files (css, images etc)
 */
function setupViewLayerMiddleware() {
  app.use(express.static(path.join(__dirname, './public')))
  app.set('views', path.join(__dirname, './views'))
  app.set('view engine', 'pug')
}

/**
 * General middleware for body parsing, sessions etc.
 */
function setupGeneralMiddleware() {
  app.use(require('morgan')('tiny'))
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(require('cookie-parser')('keyboard cat'))
  app.use(require('express-session')({ cookie: { maxAge: getenv.int('COOKIE_MAX_AGE', 60000) } }))
  app.use(require('connect-flash')())
}

function setupAuthMiddleware(db) {
  app.use(passport.initialize())
  app.use(passport.session())
  app.use((req, res, next) => {
    // Make user object available to templates. Also indicates if a user
    // is logged in.
    res.locals.user = req.user
    next()
  })
  passport.use(require('./lib/localAuthStrategy')(db))
  passport.use(require('./lib/googleAuthStrategy')(db))
  passport.use(require('./lib/facebookAuthStrategy')(db))
  /**
   * This function tells Passport how to store the user
   * in the session cookie.
   */
  passport.serializeUser((user, done) => {
    done(null, user && user._id && user._id.toString())
  })
  /**
   * This function tells Passport how to retrieve the user
   * from the session cookie.
   */
  passport.deserializeUser((id, done) => {
    const users = db.collection('users')
    users.findOne({ _id: new ObjectID(id) }, (error, user) => {
      done(error, user)
    })
  })
}
