const logger = require('./logger')(__filename)

module.exports = {
  handle404: function (req, res) {
    res.status(404).render('pages/404')
  },
  handleAll: function (error, req, res, _next) {
    logger.error('Catch all', error)
    const isDev = req.app.get('env') === 'development'
    res.status(error.status || 500)
    if (isDev) {
      // A detailed error page for developers.
      res.render('pages/error-dev', { error })
    } else {
      // A user friendly error page for users.
      res.render('pages/error-prod')
    }
  },
}
