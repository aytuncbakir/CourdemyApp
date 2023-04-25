const fs = require('fs');
const Course = require('../models/course');
const Category = require('../models/category');
const Role = require('../models/role');
const User = require('../models/user');
const { Op } = require('sequelize');
const sequelize = require('../data/db');
const slugField = require('../helpers/slugfield');

exports.get_course_delete = async function (req, res) {
  const slug = req.params.slug;
  const userid = req.session.userid;
  const isAdmin = req.session.roles.includes('admin');

  try {
    const course = await Course.findOne({
      where: isAdmin
        ? { url: slug }
        : {
            url: slug,
            userId: userid,
          },
    });
   
    if (course) {
      return res.render('admin/course-delete', {
        title: 'Course Delete',
        course: course,
      });
    }
 
    res.render('/admin/courses');
  } catch (error) {
    console.log(error);
  }
};

exports.post_course_delete = async function (req, res) {
  const slug = req.body.slug;
  try {
    const course = await Course.findOne({
      where: {
        url: slug,
      },
    });
    if (course) {
      await course.destroy();
      return res.redirect('/admin/courses?action=delete');
    }
    res.redirect('/admin/courses');
  } catch (error) {
    console.log(error);
  }
};

exports.get_course_create = async function (req, res) {
  try {
    const categories = await Category.findAll();
    res.render('admin/course-create', {
      title: 'Add Course',
      categories: categories,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.post_course_create = async function (req, res) {
  const title = req.body.title;
  const subtitle = req.body.subtitle;
  const description = req.body.description;
  const homepage = req.body.homepage == 'on' ? true : false;
  const confirm = req.body.confirm == 'on' ? true : false;
  const userid = req.session.userid;
  let image = '';

  try {
    if (title == '') {
      throw new Error('Title cannot be left blank!');
    }

    if (title.length < 5 || title.length > 20) {
      throw new Error("Title's length has to be between 5-20!");
    }

    if (req.file) {
      image = req.file.filename;
      fs.unlink('./public/images/' + req.body.image, (err) => console.log(err));
    }

    if (description == '') {
      throw new Error('Description cannot be left blank!');
    }

    await Course.create({
      title: title,
      url: slugField(title),
      subtitle: subtitle,
      description: description,
      image: image,
      homepage: homepage,
      confirm: confirm,
      userId: userid,
    });
    res.redirect('/admin/courses?action=create');
  } catch (error) {
    let errorMessage = '';
    if (error instanceof Error) {
      errorMessage += error.message;
      res.render('admin/course-create', {
        title: 'Add Course',
        categories: await Category.findAll(),
        message: { text: errorMessage, class: 'danger' },
        values: {
          title: title,
          subtitle: subtitle,
          description: description,
        },
      });
    }
    console.log(error);
  }
};

exports.get_course_edit = async function (req, res) {
  const { courseid } = req.params;
  const userid = req.session.userid;
  const isAdmin = req.session.roles.includes('admin');
  try {
    const course = await Course.findOne({
      where: isAdmin
        ? { id: courseid }
        : {
            id: courseid,
            userId: userid,
          },
      include: {
        model: Category,
        attributes: ['id'],
      },
    });

    const categories = await Category.findAll();
    if (course) {
      return res.render('admin/course-edit', {
        title: course.title,
        course: course,
        categories: categories,
      });
    }
    res.redirect('/admin/courses');
  } catch (error) {
    console.log(error);
  }
};

exports.post_course_edit = async function (req, res) {
  const { courseid } = req.body;
  const { title } = req.body;
  const { subtitle } = req.body;
  const { description } = req.body;
  const categoryIds = req.body.categories;
  const url = req.body.url;
  let { image } = req.body;
  const userid = req.session.userid;

  console.log(categoryIds);
  if (req.file) {
    image = req.file.filename;
    fs.unlink('./public/images/' + req.body.image, (err) => {
      console.log(err);
    });
  }

  const homepage = req.body.homepage == 'on' ? true : false;
  const confirm = req.body.confirm == 'on' ? true : false;
  const isAdmin = req.session.roles.includes('admin');

  try {
    const course = await Course.findOne({
      where: isAdmin
        ? { id: courseid }
        : {
            id: courseid,
            userId: userid,
          },
      include: {
        model: Category,
        attributes: ['id'],
      },
    });
    if (course) {
      course.title = title;
      course.subtitle = subtitle;
      course.description = description;
      course.image = image;
      course.homepage = homepage;
      course.confirm = confirm;
      course.url = url;

      if (categoryIds == undefined) {
        await course.removeCategories(course.categories);
      } else {
        await course.removeCategories(course.categories);
        const selectedCategories = await Category.findAll({
          where: {
            id: {
              [Op.in]: categoryIds,
            },
          },
        });
        await course.addCategories(selectedCategories);
      }

      await course.save();
      return res.redirect('/admin/courses?action=edit&courseid=' + courseid);
    }
    res.redirect('/admin/courses');
  } catch (error) {
    console.log(error);
  }
};

exports.get_courses = async function (req, res) {
  const userid = req.session.userid;
  const isAdmin = req.session.roles.includes('admin');
  const isTeacher = req.session.roles.includes('teacher');

  try {
    const courses = await Course.findAll({
      attributes: ['id', 'title', 'url', 'subtitle', 'image'],
      include: {
        model: Category,
        attributes: ['name'],
      },
      where: isTeacher && !isAdmin ? { userId: userid } : null,
    });
    res.render('admin/course-list', {
      title: 'Course - List',
      courses: courses,
      action: req.query.action,
      courseid: req.query.courseid,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.get_categories = async function (req, res) {
  try {
    const categories = await Category.findAll();
    res.render('admin/category-list', {
      title: 'Category List',
      categories: categories,
      action: req.query.action,
      categoryid: req.query.categoryid,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.get_category_create = async function (req, res) {
  try {
    res.render('admin/category-create', {
      title: 'Add Category',
    });
  } catch (error) {
    next(err);
  }
};

exports.post_category_create = async function (req, res) {
  const name = req.body.name;
  console.log(slugField(name));
  try {
    await Category.create({ name: name, url: slugField(name) });
    res.redirect('/admin/categories?action=create');
  } catch (error) {
    console.log(error);
  }
};

exports.get_category_edit = async function (req, res) {
  const { slug } = req.params;

  try {
    const category = await Category.findOne({
      where: {
        url: slug,
      },
    });

    const courses = await category.getCourses();
    const coursesCount = await category.countCourses();

    if (category) {
      return res.render('admin/category-edit', {
        title: category.name,
        category: category,
        courses: courses,
        coursesCount: coursesCount,
      });
    }

    res.redirect('admin/categories');
  } catch (error) {
    console.log(error);
  }
};

exports.post_category_edit = async function (req, res) {
  const { slug } = req.params;
  const { name } = req.body;
  try {
    const category = await Category.findOne({
      where: {
        url: slug,
      },
    });

    console.log(category);

    if (category) {
      category.name = name;
      category.url = slugField(name);
      category.save();

      return res.redirect('/admin/categories?action=edit&slug=' + slug);
    }
    res.redirect('/admin/categories');
  } catch (error) {
    console.log(error);
  }
};

exports.get_category_delete = async function (req, res) {
  const slug = req.params.slug;
  try {
    const category = await Category.findOne({
      where: {
        url: slug,
      },
    });
    if (category) {
      return res.render('admin/category-delete', {
        title: 'Category Delete',
        category: category,
      });
    }
    res.redirect('/admin/categories');
  } catch (error) {
    console.log(error);
  }
};

exports.post_category_delete = async function (req, res) {
  const slug = req.params.slug;
  try {
    Category.destroy({
      where: {
        url: slug,
      },
    });
    return res.redirect('/admin/categories?action=delete&slug=' + slug);
  } catch (error) {
    console.log(error);
  }
};

exports.get_category_remove = async function (req, res) {
  const courseid = req.body.courseid;
  const categoryid = req.body.categoryid;

  try {
    await sequelize.query(
      `delete from courseCategories where courseId=${courseid} and categoryId=${categoryid}`
    );
    res.redirect('/admin/categories/' + categoryid);
  } catch (error) {
    console.log(error);
  }
};

exports.get_roles = async function (req, res) {
  try {
    const roles = await Role.findAll({
      attributes: {
        include: [
          'role.id',
          'role.rolename',
          [sequelize.fn('COUNT', sequelize.col('users.id')), 'user_count'],
        ],
      },
      include: [
        {
          model: User,
          attributes: ['id'],
        },
      ],
      group: ['role.id'],
      raw: true,
      includeIgnoreAttributes: false,
    });

    res.render('admin/role-list', {
      title: 'role List',
      roles: roles,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.get_role_edit = async function (req, res) {
  const roleid = req.params.roleid;
  try {
    const role = await Role.findByPk(roleid);
    const users = await role.getUsers();
    if (role) {
      return res.render('admin/role-edit', {
        title: 'Role edit',
        role: role,
        users: users,
      });
    }

    res.redirect('admin/roles');
  } catch (error) {
    console.log(error);
  }
};

exports.post_role_edit = async function (req, res) {
  const roleid = req.body.roleid;
  const rolename = req.body.rolename;
  try {
    await Role.update(
      { rolename: rolename },
      {
        where: { id: roleid },
      }
    );
    return res.redirect('/admin/roles');
  } catch (error) {
    console.log(error);
  }
};

exports.roles_remove = async function (req, res) {
  const roleid = req.body.roleid;
  const userid = req.body.userid;
  try {
    await sequelize.query(
      `delete from userRoles where userId=${userid} and roleId=${roleid}`
    );
    return res.redirect('/admin/roles/' + roleid);
  } catch (error) {
    console.log(error);
  }
};

exports.get_users = async function (req, res) {
  try {
    const users = await User.findAll({
      attributes: ['id', 'fullname', 'email'],
      include: {
        model: Role,
        attributes: ['rolename'],
      },
    });

    res.render('admin/user-list', {
      title: 'user List',
      users: users,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.get_user_edit = async function (req, res) {
  const userid = req.params.userid;
  try {
    const user = await User.findOne({
      where: { id: userid },
      include: { model: Role, attributes: ['id'] },
    });

    const roles = await Role.findAll();

    res.render('admin/user-edit', {
      title: 'user List',
      user: user,
      roles: roles,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.post_user_edit = async function (req, res) {
  const userid = req.body.userid;
  const fullname = req.body.fullname;
  const email = req.body.email;
  const roleIds = req.body.roles;
  // console.log(req.body);
  try {
    const user = await User.findOne({
      where: { id: userid },
      include: { model: Role, attributes: ['id'] },
    });

    if (user) {
      user.fullname = fullname;
      user.email = email;

      if (roleIds == undefined) {
        await user.removeRoles(user.roles);
      } else {
        await user.removeRoles(user.roles);
        const selectedRoles = await Role.findAll({
          where: {
            id: {
              [Op.in]: roleIds,
            },
          },
        });
        await user.addRoles(selectedRoles);
      }
      await user.save();
      res.redirect('/admin/users');
    }
    res.redirect('/admin/users');
  } catch (error) {
    console.log(error);
  }
};
