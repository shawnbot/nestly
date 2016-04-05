var fs = require('fs');
var yaml = require('js-yaml');

module.exports = function write(file, data, format, done) {
  var indent = 2;
  var encoding = 'utf8';

  switch (format) {
    case 'json':
      data = JSON.stringify(data, null, indent);
      break;

    case 'yaml':
    case 'yml':
      data = yaml.safeDump(data, {indent: indent});
      break;

    default:
      return done('Invalid output format: "' + format + '"');
  }

  if (typeof file === 'object') {
    return file
      .write(data, done);
  }
  return fs.writeFile(filename, data, encoding, done);
};
