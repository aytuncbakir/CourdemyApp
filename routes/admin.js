const express = require('express');
const router = express.Router();

const imageUpload = require('../helpers/image-upload');
const isAdmin = require('../middlewares/is-admin');
const isTeacher = require('../middlewares/is-teacher');
const csrf = require('../middlewares/csrf');

const adminController = require('../controllers/admin');

router.get(
  '/course/delete/:slug',
  isTeacher,
  csrf,
  adminController.get_course_delete
);
router.post(
  '/course/delete/:slug',
  isTeacher,
  adminController.post_course_delete
);

router.get(
  '/category/delete/:slug',
  isAdmin,
  csrf,
  adminController.get_category_delete
);

router.post(
  '/category/delete/:slug',
  isAdmin,
  adminController.post_category_delete
);

router.get('/course/create', isTeacher, csrf, adminController.get_course_create);

router.post('/categories/remove', isAdmin, adminController.get_category_remove);

router.post(
  '/course/create',
  isTeacher,
  csrf,
  imageUpload.upload.single('image'),
  adminController.post_course_create
);

router.get(
  '/category/create',
  isAdmin,
  csrf,
  adminController.get_category_create
);

router.post('/category/create', isAdmin, adminController.post_category_create);

router.get('/courses/:courseid', isTeacher, csrf, adminController.get_course_edit);

router.post(
  '/courses/:courseid',
  isTeacher,
  csrf,
  imageUpload.upload.single('image'),
  adminController.post_course_edit
);

router.get(
  '/categories/:slug',
  isAdmin,
  csrf,
  adminController.get_category_edit
);

router.post('/categories/:slug', isAdmin, adminController.post_category_edit);

router.get('/courses', isTeacher, adminController.get_courses);

router.get('/categories', isAdmin, adminController.get_categories);

router.get('/roles', isAdmin, adminController.get_roles);
router.get('/roles/:roleid', isAdmin, csrf, adminController.get_role_edit);
router.post('/roles/remove', isAdmin, adminController.roles_remove);
router.post('/roles/:roleid', isAdmin, adminController.post_role_edit);

router.get('/users', isAdmin, adminController.get_users);
router.get('/users/:userid', isAdmin, csrf, adminController.get_user_edit);
// router.post('/users/remove', isAdmin, adminController.users_remove);
router.post('/users/:userid', isAdmin, adminController.post_user_edit);

module.exports = router;
