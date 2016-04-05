var interpolate = require('./template').interpolate;

module.exports = function groupBy(data, template) {
  var key = interpolate(template);
  var groups = {};
  data.forEach(function(d) {
    var g = key(d);
    if (g in groups) {
      groups[g].push(d);
    } else {
      groups[g] = [d];
    }
  });
  return Object.keys(groups)
    .map(function(g) {
      return {
        key: g,
        values: groups[g]
      };
    });
};

