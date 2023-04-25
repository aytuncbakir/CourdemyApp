module.exports = (req, res, next) => {
  if (!req.session.isAuth) {
    return res.redirect('/account/login?returnUrl=' + req.originalUrl); // => /admin/courses
  }

  if (
    !req.session.roles.includes('admin') &&
    !req.session.roles.includes('teacher')
  ) {
    req.session.message = {
      text: 'Login with an authorized user',
      class: 'warning',
    };
    res.redirect('/account/login?returnUrl=' + req.originalUrl);
  }

  next();
};
