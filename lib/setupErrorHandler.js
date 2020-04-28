const logger = require('./logger')

module.exports = (app) => {
  // Page not found
  app.use((req, res, _next) => {
    res.status(404).render('pages/404')
  })
  // Server error
  app.use((err, req, res, _next) => {
    logger.error('Error', err.stack)
    res.status(res.statusCode || 500).render('pages/500')
  })
}
