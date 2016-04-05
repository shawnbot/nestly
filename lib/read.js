var fs = require('fs');
var tito = require('tito');
var yaml = require('js-yaml');

module.exports = function read(filename, format, done) {
  var encoding = 'utf8';

  switch (format) {
    case 'yaml':
    case 'yml':
      return fs.readFile(filename, encoding, function(error, buffer) {
        if (error) {
          return done(error);
        }
        var parsed = yaml.safeLoad(buffer.toString());
        return done(null, parsed);
      });

    case 'js':
      if (!filename.match(/^[\.\/]/)) {
        filename = './' + filename;
      }
      return done(null, require(filename));
  }

  var parse = tito.formats.createReadStream(format);
  var data = [];
  fs.createReadStream(filename)
    .pipe(parse)
    .on('data', function(d) { data.push(d); })
    .on('end', function() {
      done(null, data);
    });
};
