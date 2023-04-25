const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const isStudent = require("../middlewares/is-student");
const csrf = require('../middlewares/csrf');

router.get('/courses/category/:slug', userController.course_list);
router.get('/courses/:slug', userController.courses_details);
router.get('/courses', userController.course_list);
router.get('/student/courses', userController.my_course_list);
router.post('/course/add',isStudent, csrf,  userController.post_course_add);
router.get('/', userController.index);
module.exports = router;
