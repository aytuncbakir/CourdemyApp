// express
const express = require('express');
//Creating server by using express
const app = express();

// session
const cookieParser = require('cookie-parser');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const csurf = require('csurf');

//node modules
const path = require('path');

// Models
const Course = require('./models/course');
const Category = require('./models/category');
const User = require('./models/user');
const Role = require('./models/role');

//routes
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');

//custom modules
const sequelize = require('./data/db');
const dummyData = require('./data/dummy-data');
const locals = require('./middlewares/locals');
const log = require('./middlewares/log');
const errorHandling = require('./middlewares/error-handling');

// Template - Engine  / Setting template engine - Ejs
app.set('view engine', 'ejs');



// middlewares
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: 'hello world', // s_id: IEUREIRU748339874397493483HHJDS
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60,
    },
    store: new SequelizeStore({
      db: sequelize,
    }),
  })
);

app.use(locals);
app.use(csurf());

// settind to use static sources (css, js, images, ...)
app.use('/libs', express.static(path.join(__dirname, 'node_modules')));
app.use('/static', express.static(path.join(__dirname, 'public')));

// routing
app.use('/admin', adminRoutes);
app.use('/account', authRoutes);
app.use(userRoutes);

//errors
app.use('*', (req, res) => {
  res.status(404).render('error/404', { title: 'Page not found!' });
});
app.use(errorHandling);

//log
app.use(log);

// set relations
// One to One
Course.belongsTo(User, {
  foreignKey: {
    allowNull: true,
  },
});
User.hasMany(Course); // One to Many

// many-to-many relations
Course.belongsToMany(Category, { through: 'courseCategories' });
Category.belongsToMany(Course, { through: 'courseCategories' });

Role.belongsToMany(User, { through: 'userRoles' });
User.belongsToMany(Role, { through: 'userRoles' });

Course.belongsToMany(User, { through: 'userCourses' });
User.belongsToMany(Course, { through: 'userCourses' });



//IIFE  --- Load dummy-data
(async () => {
  // await sequelize.sync({ force: true });
  // await dummyData();
})();

// server start to liste port 3000
app.listen(3000, function () {
  console.log('Listening on port 3000');
});
