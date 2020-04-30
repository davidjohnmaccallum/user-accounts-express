const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator')
const normalizeEmailOptions = require('../lib/normalizeEmailOptions')
const bcrypt = require('bcrypt')
const passport = require('passport')
const logger = require('../lib/logger')(__filename)
const guard = require('../lib/routeGuard')

/**
 * Login, sign up and my profile
 */
router.get('/login', (req, res) => {
  if (req.user) {
    return res.redirect('/protected')
  }
  res.render('pages/login', { error: req.flash('error') })
})
// See http://www.passportjs.org/docs/username-password/
router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/protected',
    failureRedirect: '/users/login',
    failureFlash: true,
  })
)
// See http://www.passportjs.org/docs/google/
router.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
  })
)
router.get(
  '/auth/google/callback',
  (req, res, next) => {
    logger.debug('/auth/google/callback', req.body, req.query)
    next()
  },
  passport.authenticate('google', { failureRedirect: '/users/login' }),
  function (req, res) {
    res.redirect('/protected')
  }
)
// See http://www.passportjs.org/docs/facebook/
router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }))
router.get(
  '/auth/facebook/callback',
  (req, res, next) => {
    console.log('/auth/facebook/callback', req.body, req.query)
    logger.debug('/auth/facebook/callback', req.body, req.query)
    next()
  },
  passport.authenticate('facebook', {
    successRedirect: '/protected',
    failureRedirect: '/users/login',
  })
)

router.get('/logout', (req, res) => {
  req.logout()
  delete req.app.locals.user
  res.redirect('/')
})

router.get('/signup', (req, res) =>
  res.render('pages/signup', {
    values: {},
    errors: {},
  })
)

router.post(
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
    const users = req.db.collection('users')
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
            res.redirect('/protected')
          })
        })
      })
    })
  }
)

router.get('/my-profile', guard.private, (req, res) => {
  res.render('pages/my-profile', {
    values: req.user,
    errors: {},
  })
})

router.post(
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

    const users = req.db.collection('users')
    users.replaceOne({ email: req.body.email }, { ...req.user, ...req.body }, (error) => {
      if (error) return next(error)
      res.redirect('/my-profile')
    })
  }
)

module.exports = router
