var curry = require('curry');
var template = require('./lib/template');
var groupBy = require('./lib/group-by');
var interpolate = template.interpolate;

var nest = function(struct, data) {
  switch (typeof struct) {
    case 'string':
      if (Array.isArray(data)) {
        data = data[0];
      }
      return interpolate(struct, data);
    case 'number':
      return data[struct];
    case 'boolean':
      return struct;
    case 'undefined':
      return null;
  }
  if (Array.isArray(struct)) {
    struct = struct[0];
    return data.map(function(d) {
      return nest(struct, d);
    });
  }
  return nestKeys(struct, data);
};

var nestKeys = function(obj, data) {
  var out = {};
  var keys = Object.keys(obj);
  var key0 = keys[0];
  if (keys.length === 1 && template.is(key0)) {
    var groups = groupBy(data, key0);
    var value = obj[key0];
    groups.forEach(function(group) {
      out[group.key] = nest(value, group.values);
    });
  } else {
    keys.forEach(function(key) {
      out[key] = nest(obj[key], data);
    });
  }
  return out;
};

module.exports = curry(function(structure, data) {
  return nest(structure, data);
});
