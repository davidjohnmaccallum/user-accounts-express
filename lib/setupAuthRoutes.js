const passport = require('passport')

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
  app.get('/logout', (req, res) => {
    req.logout()
    delete app.locals.user
    res.redirect('/')
  })
}
