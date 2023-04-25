const User = require('../models/user');
const bcrypt = require('bcrypt');
const emailService = require('../helpers/send-mail');
const config = require('../config/config');
const ctypto = require('crypto');
const { Op } = require('sequelize');
const Role = require('../models/role');

exports.get_register = async function (req, res, next) {
  try {
    return res.render('auth/register', {
      title: 'register',
    });
  } catch (err) {
    next(err);
  }
};

exports.post_register = async function (req, res, next) {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const userRole = req.body.userRole;
  const roles = await Role.findAll();

  try {
    const newUser = await User.create({
      fullname: name,
      email: email,
      password: password,
    });

    if(userRole){
      if(userRole == "student"){
        await newUser.addRole(roles[2]); //  => student
      }
      if(userRole == "teacher"){
        await newUser.addRole(roles[1]); //  => teacher
      }
    }else return res.redirect('login');

    /** Make email sending configuration then open code*/
    emailService.sendMail({
      from: config.email.from,
      to: newUser.email,
      subject: 'Your account has been created.',
      text: 'Your account has been successfully created.',
    });

    req.session.message = {
      text: 'Login your account.',
      class: 'success',
    };
     res.redirect('login');
  } catch (err) {
    let msg = '';
    if (
      err.name == 'SequelizeValidationError' ||
      err.name == 'SequelizeUniqueConstraintError'
    ) {
      for (let e of err.errors) {
        msg += e.message + ' ';
      }

      return res.render('auth/register', {
        title: 'register',
        message: { text: msg, class: 'danger' },
      });
    } else {
      next(err);
    }
  }
};

exports.get_login = async function (req, res, next) {
  const message = req.session.message;
  delete req.session.message;
  try {
    return res.render('auth/login', {
      title: 'login',
      message: message,
      csrfToken: req.csrfToken(),
    });
  } catch (err) {
    next(err);
  }
};

exports.get_logout = async function (req, res, next) {
  try {
    await req.session.destroy();
    return res.redirect('/account/login');
  } catch (err) {
    next(err);
  }
};

exports.post_login = async function (req, res) {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await User.findOne({
      where: {
        email: email,
      },
    });

    if (!user) {
      return res.render('auth/login', {
        title: 'login',
        message: { text: 'Wrong email', class: 'danger' },
      });
    }

    // password check
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      // session

      const userRoles = await user.getRoles({
        attributes: ['rolename'],
        raw: true,
      });
      req.session.roles = userRoles.map((role) => role['rolename']);
      req.session.isAuth = true;
      req.session.fullname = user.fullname;
      req.session.userid = user.id;
      const url = req.query.returnUrl || '/';
      
      return  res.redirect(url);
    }

    return res.render('auth/login', {
      title: 'login',
      message: { text: 'Wrong password', class: 'danger' },
    });
  } catch (err) {
    next(err);
  }
};

exports.get_reset_password = async function (req, res, next) {
  const message = req.session.message;
  delete req.session.message;
  try {
    return res.render('auth/reset-password', {
      title: 'reset password',
      message: message,
    });
  } catch (err) {
    next(err);
  }
};

exports.post_reset_password = async function (req, res, next) {
  const email = req.body.email;
  console.log(email);
  try {
    var token = ctypto.randomBytes(32).toString('hex');

    const user = await User.findOne({ where: { email: email } });

    if (!user) {
      req.session.message = { text: 'Email not found!', class: 'danger' };
      return res.redirect('reset-password');
    }

    user.resetToken = token;
    user.resetTokenExpiration = Date.now() + 1000 * 60 * 60;
    await user.save();
   
    emailService.sendMail({
      from: config.email.from,
      to: email,
      subject: 'Reset Password',
      html: `
                <p>Click link to update your password.</p>
                <p>${token}</p>
                <p>
                    <a href="http://127.0.0.1:3000/account/new-password/${token}">Password<a/>
                </p>
            `,
    });

    req.session.message = {
      text: 'Check your email to reset your password.',
      class: 'success',
    };
    res.redirect('login');
  } catch (err) {
    next(err);
  }
};

exports.get_newpassword = async function (req, res, next) {
  const token = req.params.token;

  console.log('----', token);

  try {
    const user = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpiration: {
          [Op.gt]: Date.now(),
        },
      },
    });

    return res.render('auth/new-password', {
      title: 'new password',
      token: token,
      userId: user.id,
    });
  } catch (err) {
    next(err);
  }
};

exports.post_newpassword = async function (req, res, next) {
  const token = req.body.token;
  const userId = req.body.userId;
  const newPassword = req.body.password;

  try {
    const user = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpiration: {
          [Op.gt]: Date.now(),
        },
        id: userId,
      },
    });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = null;
    user.resetTokenExpiration = null;
    await user.save();

    req.session.message = { text: 'Password has been updated!', class: 'success' };
    return res.redirect('login');
  } catch (err) {
    next(err);
  }
};
