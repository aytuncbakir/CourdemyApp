module.exports = (err, req, res, next) => {
  console.log('logging', err.message);
  next(err); // logging => winston , email
};
