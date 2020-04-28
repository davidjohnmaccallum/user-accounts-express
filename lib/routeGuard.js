const private = (req, res, next) => {
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

module.exports = { private, role }
