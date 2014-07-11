module.exports = process.env.WRAPPERS_COV
  ? require('./lib-cov/wrappers.js')
  : require('./lib/wrappers.js');
