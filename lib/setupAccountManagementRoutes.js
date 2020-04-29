const { check, validationResult } = require('express-validator')
const normalizeEmailOptions = require('./normalizeEmailOptions')
const bcrypt = require('bcrypt')
const guard = require('./routeGuard')

module.exports = (app, db, signupSuccessRedirect) => {
  const users = db.collection('users')

  app.get('/signup', (req, res) =>
    res.render('pages/signup', {
      values: {},
      errors: {},
    })
  )

  app.post(
    '/signup',
    [
      check('email')
        .isEmail()
        .withMessage('Not a valid email address.')
        .normalizeEmail(normalizeEmailOptions)
        .trim(),
      check('fullName')
        .exists({ checkFalsy: true })
        .withMessage('This is required.')
        .normalizeEmail(normalizeEmailOptions)
        .trim(),
      check('password')
        .isLength({ min: 5 })
        .withMessage('Password must be at least 5 chars long.')
        .trim(),
      check('confirmPassword', 'Confirm password must match password.')
        .exists()
        .custom((value, { req }) => value === req.body.password)
        .trim(),
    ],
    (req, res, next) => {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.render('pages/signup', {
          values: { ...req.body },
          errors: errors.mapped(),
        })
      }

      // Check if email already registered
      users.count({ email: req.body.email }, (error, count) => {
        if (error) return next(error)
        if (count > 0) {
          return res.render('pages/signup', {
            values: { ...req.body },
            errors: {
              email: { msg: 'This email is already registered.' },
            },
          })
        }

        // Hash the password
        bcrypt.hash(req.body.password, 10, (error, passwordHash) => {
          if (error) return next(error)
          // Create the user
          delete req.body.password
          const user = { ...req.body, passwordHash, roles: ['user'] }
          users.insertOne(user, (error) => {
            if (error) return next(error)
            // Log the user in
            req.login(user, (error) => {
              if (error) return next(error)
              res.redirect(signupSuccessRedirect)
            })
          })
        })
      })
    }
  )

  app.get('/my-profile', guard.private, (req, res) => {
    res.render('pages/my-profile', {
      values: req.user,
      errors: {},
    })
  })

  app.post(
    '/my-profile',
    guard.private,
    [
      check('email')
        .isEmail()
        .withMessage('Not a valid email address.')
        .normalizeEmail(normalizeEmailOptions)
        .trim(),
    ],
    (req, res, next) => {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.render('pages/signup', {
          values: { ...req.body },
          errors: errors.mapped(),
        })
      }

      users.replaceOne({ email: req.body.email }, { ...req.user, ...req.body }, (error) => {
        if (error) return next(error)
        res.redirect('/my-profile')
      })
    }
  )
}
