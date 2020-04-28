const express = require('express')
const getenv = require('getenv')
const logger = require('./lib/logger')
const app = express()
const port = getenv.int('PORT', 3000)
const connectDb = require('./lib/connectDb')
const setupMiddleware = require('./lib/setupMiddleware')
const setupErrorHandler = require('./lib/setupErrorHandler')
const guard = require('./lib/routeGuard')
const setupAuthRoutes = require('./lib/setupAuthRoutes')
const setupAccountManagementRoutes = require('./lib/setupAccountManagementRoutes')

connectDb((error, db) => {
  if (error) return logger.error('Error connecting to DB', error)

  setupMiddleware(app, db)
  app.get('/', (req, res) => res.render('pages/index'))
  setupAuthRoutes(app)
  setupAccountManagementRoutes(app, db, '/protected')
  app.get('/protected', guard.private, guard.role('user'), (req, res) =>
    res.render('pages/protected')
  )

  setupErrorHandler(app)

  app.listen(port, () => logger.info(`Listening on port ${port}.`))
})
