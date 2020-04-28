const { check, validationResult } = require('express-validator')
const normalizeEmailOptions = require('./normalizeEmailOptions')
const bcrypt = require('bcrypt')

module.exports = (app, db, signupSuccessRedirect) => {
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
      const users = db.collection('users')
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
          // Create the user
          const user = { email: req.body.email, passwordHash, roles: ['user'] }
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
}
