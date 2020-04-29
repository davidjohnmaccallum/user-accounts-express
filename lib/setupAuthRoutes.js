const passport = require('passport')
const logger = require('./logger')

module.exports = (app) => {
  app.get('/login', (req, res) => res.render('pages/login', { error: req.flash('error') }))

  app.post(
    '/login',
    passport.authenticate('local', {
      successRedirect: '/protected',
      failureRedirect: '/login',
      failureFlash: true,
    })
  )

  // GET /auth/google
  //   Use passport.authenticate() as route middleware to authenticate the
  //   request.  The first step in Google authentication will involve
  //   redirecting the user to google.com.  After authorization, Google
  //   will redirect the user back to this application at /auth/google/callback
  app.get(
    '/auth/google',
    passport.authenticate('google', {
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
    })
  )

  // GET /auth/google/callback
  //   Use passport.authenticate() as route middleware to authenticate the
  //   request.  If authentication fails, the user will be redirected back to the
  //   login page.  Otherwise, the primary route function function will be called,
  //   which, in this example, will redirect the user to the home page.
  app.get(
    '/auth/google/callback',
    (req, res, next) => {
      logger.debug('/auth/google/callback', req.body, req.query)
      next()
    },
    passport.authenticate('google', { failureRedirect: '/login' }),
    function (req, res) {
      res.redirect('/protected')
    }
  )

  app.get('/logout', (req, res) => {
    req.logout()
    delete app.locals.user
    res.redirect('/')
  })
}
