module.exports = function (req, res, next) {
  res.locals.isAuth = req.session.isAuth;
  res.locals.fullname = req.session.fullname;
  res.locals.isAdmin = req.session.roles
    ? req.session.roles.includes('admin')
    : false;
  res.locals.isTeacher = req.session.roles
    ? req.session.roles.includes('teacher')
    : false;
  res.locals.isStudent = req.session.roles
    ? req.session.roles.includes('student')
    : false;
  next();
};
