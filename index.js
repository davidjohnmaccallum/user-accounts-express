const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const passport = require('passport')
const flash = require('connect-flash')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const getenv = require('getenv')
const logger = require('./lib/logger')
const morgan = require('morgan')
const app = express()
const port = getenv.int('PORT', 3000)
const dbName = 'user-accounts-express'

/*
 * Connect to MongoDB
 */
const mongoConnect = require('./lib/mongoConnect')
const mongoClient = mongoConnect(dbName)
mongoClient.connect((error) => {
  if (error) {
    logger.error('Error connecting to MongoDB', error)
    return
  }

  const db = mongoClient.db(dbName)

  /*
   * Setup view layer.
   */
  app.use(express.static(path.join(__dirname, 'public')))
  app.set('views', path.join(__dirname, 'views'))
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
  const localAuth = require('./lib/localAuth')
  passport.use(localAuth.strategy(db))
  passport.serializeUser(localAuth.serializeUser)
  passport.deserializeUser(localAuth.deserializeUser(db))

  app.get('/', (req, res) => res.render('pages/index'))
  app.get('/login', (req, res) => res.render('pages/login', { error: req.flash('error') }))
  app.post(
    '/login',
    passport.authenticate('local', {
      successRedirect: '/protected',
      failureRedirect: '/login',
      failureFlash: true,
    })
  )
  app.get('/logout', (req, res) => {
    req.logout()
    delete app.locals.user
    res.redirect('/')
  })
  app.get('/signup', (req, res) => res.render('pages/signup'))
  app.post('/process-signup', (req, res) => {
    logger.debug(req.body)
    res.redirect('/protected')
  })
  app.get('/protected', auth, role('user'), (req, res) => res.render('pages/protected'))

  /**
   * Error handlers
   */
  app.use((req, res, _next) => {
    res.status(404).render('pages/404')
  })
  app.use((err, req, res, _next) => {
    logger.error('Error', err.stack)
    res.status(res.status || 500).render('pages/500')
  })

  app.listen(port, () => logger.info(`Listening on port ${port}.`))
})

const auth = (req, res, next) => {
  if (!req.user) {
    return res.redirect('login')
  }
  next()
}

const role = (requiredRole) => (req, res, next) => {
  const userRoles = req.user?.roles || []
  if (!userRoles.includes(requiredRole)) {
    return res.status(403).render('pages/403')
  }
  next()
}
