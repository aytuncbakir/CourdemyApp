const { DataTypes } = require('sequelize');
const sequelize = require('../data/db');

const Course = sequelize.define(
  'course',
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subtitle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    homepage: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    confirm: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    validate: {
      checkValidOnay() {
        if (this.homepage && !this.confirm) {
          throw new Error('You did not confirm homepage course!');
        }
      },
    },
  }
);

module.exports = Course;
