const { DataTypes } = require('sequelize');
const sequelize = require('../data/db');
const bcrypt = require('bcrypt');

const User = sequelize.define(
  'user',
  {
    fullname: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Please enter name and surname!',
        },
        isFullname(value) {
          if (value.split(' ').length < 2) {
            throw new Error('Please enter a surname!');
          }
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        args: true,
        msg: 'Email has been registered!',
      },
      validate: {
        notEmpty: {
          msg: 'Please enter email!',
        },
        isEmail: {
          msg: 'Please enter email with correct format!',
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Paaword can not be empty!',
        },
        len: {
          args: [5, 10],
          msg: 'Password length has to be between 5 and 1o characters!',
        },
      },
    },
    resetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetTokenExpiration: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  { timestamps: true }
);

User.afterValidate(
  async (user) => (user.password = await bcrypt.hash(user.password, 10))
);

module.exports = User;
