var curry = require('curry');

module.exports = {
  is: function(str) {
    return str.match(/{.+}/);
  },

  interpolate: curry(function(template, data) {
    var match = template.match(/^{([^}]+)}$/);
    return match
      ? data[match[1]]
      : template.replace(/{([^}]+)}/g, function(match, key) {
          return data[key];
        });
  })
};
