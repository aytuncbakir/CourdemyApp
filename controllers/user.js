const Course = require('../models/course');
const Category = require('../models/category');
const { Op } = require('sequelize');
const pageConfig = require('../config/config');
const User = require('../models/user');


exports.courses_details = async function (req, res) {
  const slug = req.params.slug;
  try {
    const course = await Course.findOne({
      where: {
        url: slug,
      },
      raw: true,
    });
    if (course) {
      return res.render('users/course-details', {
        title: course.title,
        course: course,
        // isAuth: req.session.isAuth,
      });
    }
    res.redirect('/404');
  } catch (error) {
    console.log(error);
  }
};

exports.course_list = async function (req, res) {
  const size = pageConfig.coursePerPage.size;
  const { page = 0 } = req.query;
  const slug = req.params.slug;
  try {
    const { rows, count } = await Course.findAndCountAll({
      where: {
        confirm: true,
      },
      include: slug ? { model: Category, where: { url: slug } } : null,
      raw: true,
      limit: size,
      offset: page * size,
    });

    const categories = await Category.findAll({ raw: true });
    const studentLearning = false;
    res.render('users/courses', {
      title: 'All courses',
      studentLearning:studentLearning,
      courses: rows,
      totalItems: count,
      totalPages: Math.ceil(count / size),
      currentPage: page,
      categories: categories,
      selectedCategory: slug,
      csrfToken: req.csrfToken(),
      
      // isAuth: req.session.isAuth,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.my_course_list = async function (req, res) {
 
  try {
    const userid = req.session.userid;
    const user = await User.findOne({
      where: {
        id: userid,
      },
    });
  
    const courses = await user.getCourses({ raw: true });
    console.log('++++++++++++++++++++',courses.length);
    const count = courses.length;
    const size = pageConfig.coursePerPage.size;
    const { page = 0 } = req.query;
    const slug = req.params.slug;
    const studentLearning = true;

    const categories = await Category.findAll({ raw: true });

    res.render('users/courses', {
      title: 'My Learning',
      courses: courses,
      studentLearning: studentLearning,
      totalItems: count,
      totalPages: Math.ceil(count / size),
      currentPage: page,
      categories: categories,
      selectedCategory: slug,
      csrfToken: req.csrfToken(),
      
      // isAuth: req.session.isAuth,
    });
  } catch (error) {
    console.log(error);
  }

};



exports.post_course_add =  async function (req, res) {
 
  const userid = req.session.userid;
  const courseid = req.body.courseid;

  try {
    const user = await User.findOne({
      where: {
        id: userid,
      },
    });
    const course = await Course.findOne({ where: {
      id: courseid,
    },});
  
    console.log(user);
    console.log(course);
    await course.addUser(user);
    await user.addCourse(course);
    return res.redirect('/student/courses');
  } catch (error) {
    console.log(error);
  }
  
  
}

exports.index = async function (req, res) {
  console.log(req.cookies);
  try {
    const courses = await Course.findAll({
      where: {
        [Op.and]: [
          {
            homepage: true,
            confirm: true,
          },
        ],
      },
      raw: true,
    });

    const categories = await Category.findAll({
      raw: true,
    });
    const studentLearning = false;
    res.render('users/index', {
      title: 'Populer Courses',
      studentLearning:studentLearning,
      courses: courses,
      categories: categories,
      selectedCategory: null,
      csrfToken: req.csrfToken(),
      // isAuth: req.cookies.isAuth,
      // isAuth: req.session.isAuth,
    });
  } catch (error) {
    console.log(error);
  }
};
