const Course = require('../models/course');
const Category = require('../models/category');
const User = require('../models/user');
const Role = require('../models/role');
const slugField = require('../helpers/slugfield');
const bcrypt = require('bcrypt');

async function populate() {
  await Course.sync({ alter: true });

  const count = await Category.count();
  if (count == 0) {
    const users = await User.bulkCreate([
     
      {
        fullname: 'Kari Sari',
        email: 'kari@kmail.com',
        password: await bcrypt.hash('12345', 10),
      },
      {
        fullname: 'Mika Niemi',
        email: 'mika@kmail.com',
        password: await bcrypt.hash('12345', 10),
      },
      {
        fullname: 'Sanna Otto',
        email: 'sanna@kmail.com',
        password: await bcrypt.hash('12345', 10),
      },
      {
        fullname: 'Anna Virtanen',
        email: 'anna@kmail.com',
        password: await bcrypt.hash('12345', 10),
      },
      {
        fullname: 'Tauno Sorjonen',
        email: 'tauno@kmail.com',
        password: await bcrypt.hash('12345', 10),
      },
     
    ]);

    const roles = await Role.bulkCreate([
      { rolename: 'admin' },
      { rolename: 'teacher' },
      { rolename: 'student' },
      { rolename: 'guest' },
    ]);

    await users[0].addRole(roles[0]); //  => admin - kari
    // await users[0].addRole(roles[1]); //  => teacher - kari
    await users[1].addRole(roles[1]); // => teacher - mika
    await users[2].addRole(roles[1]); // => teacher  - sanna

    await users[3].addRole(roles[2]); // => student - anna
    await users[4].addRole(roles[3]); // =>  guest - tauno
  

    const categories = await Category.bulkCreate([
      { name: 'Web Development', url: slugField('Web Development') },
      { name: 'Mobil Development', url: slugField('Mobil Development') },
      { name: 'Programming Languages', url: slugField('Programming Languages') },
    ]);
    console.log('Category is added!');

    const courses = await Course.bulkCreate([
      {
        title: 'Web Development From Scratch',
        url: slugField('Komple Web Gelistirme'),
        subtitle:'Web Development From Scratch Web Development From Scratch',
        description: 'Web Development From Scratch for all students',
        image: 'web.jpg',
        homepage: true,
        confirm: true,
        userId: 2,
      },
      {
        title: 'Java From Scratch',
        url: slugField('Java From Scratch'),
        subtitle:'Java From Scratch Java From Scratch',
        description: 'Web Development From Scratch for all students',
        image: 'java.jpg',
        homepage: true,
        confirm: true,
        userId: 2,
      },

      {
        title: 'C# From Scratch',
        url: slugField('C# From Scratch'),
        subtitle:'C# From Scratch C# From Scratch',
        description: 'C# From Scratc for all students',
        image: 'csharp.jpg',
        homepage: true,
        confirm: false,
        userId: 3,
      },

      {
        title: 'Python Development From Scratch',
        url: slugField('Python Development From Scratch'),
        subtitle:'Python Development From Scratch',
        description: 'Python Development From Scratch for all students',
        image: 'python.jpg',
        homepage: true,
        confirm: true,
        userId: 3,
      },

      {
        title: 'C Development From Scratch',
        url: slugField('C Development From Scratc'),
        subtitle:'C Development From Scratc',
        description: 'C Development From Scratch for all students',
        image: 'c.jpg',
        homepage: true,
        confirm: true,
        userId: 3,
      },

      {
        title: 'C++ Development From Scratch',
        url: slugField('C++ Development From Scratch'),
        subtitle:'C++ Development From Scratch',
        description: 'C++ Development From Scratch for all students',
        image: 'c++.jpg',
        homepage: true,
        confirm: true,
        userId: 1,
      },

      {
        title: 'PHP Development From Scratch',
        url: slugField('PHP Development From Scratch'),
        subtitle:'PHP Development From Scratch',
        description: 'PHP Development From Scratch for all students',
        image: 'php.jpg',
        homepage: true,
        confirm: true,
        userId: 1,
      },

      {
        title: 'Ruby Development From Scratch',
        url: slugField('Ruby Development From Scratch'),
        subtitle:'Ruby Development From Scratch Web Development From Scratch',
        description: 'Ruby Development From Scratch for all students',
        image: 'ruby.jpg',
        homepage: true,
        confirm: true,
        userId: 4,
      },

      {
        title: 'Javascript From Scratch',
        url: slugField('Javascript From Scratch'),
        subtitle:'Javascript From Scratch Web Development From Scratch',
        description: 'Javascript From Scratch for all students',
        image: 'javascript.jpg',
        homepage: true,
        confirm: true,
        userId: 4,
      },

      {
        title: 'Unity From Scratch',
        url: slugField('Unity From Scratch'),
        subtitle:'Unity From Scratch Web Development From Scratch',
        description: 'Unity From Scratch for all students',
        image: 'unity.jpg',
        homepage: true,
        confirm: true,
        userId: 1,
      },

    ]);

    await categories[0].addCourse(courses[0]);
    await categories[0].addCourse(courses[1]);
    await categories[0].addCourse(courses[2]);
    await categories[0].addCourse(courses[3]);
    await categories[0].addCourse(courses[4]);
    await categories[0].addCourse(courses[5]);
    await categories[0].addCourse(courses[6]);
    await categories[1].addCourse(courses[7]);
    await categories[1].addCourse(courses[8]);
    await categories[0].addCourse(courses[9]);

    await categories[1].addCourse(courses[2]);
    await categories[1].addCourse(courses[3]);

    await categories[2].addCourse(courses[2]);
    await categories[2].addCourse(courses[3]);

    await courses[0].addCategory(categories[1]);
  }
}

module.exports = populate;
