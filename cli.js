#!/usr/bin/env node
var yargs = require('yargs')
  .usage('$0 [--config file | filename] data-filename [-o | output-filename]')
  .describe('config', 'The path to your nesting configuration file')
  .describe('cf', 'The format of the config file: "json" or "yaml"')
  .default('cf', 'json')
  .describe('in', 'The path of your input data file')
  .describe('if', 'The format of the input data: "csv", "tsv", "json", or "yaml"')
  .describe('out', 'The name of the ouput file')
  .describe('of', 'The format of the output data: "json" or "yaml"')
  .default('of', 'json')
  .describe('help', 'Show this help screen')
  .alias('c', 'config')
  .alias('i', 'in')
  .alias('o', 'out')
  .alias('h', 'help')
  .wrap(72);

var options = yargs.argv;
var args = options._;

if (!options.config && args.length < 1) {
  console.warn('You must provide either the -c/--config option or a single positional argument.');
  return yargs.showHelp();
}

var inferFormat = function(file, fallback) {
  var match = (typeof file === 'string')
    ? file.match(/\.(\w+)$/)
    : false;
  return match ? match[1] : fallback;
};

var config = options.c || args.shift();
var configFormat = inferFormat(config, options.cf);

var input = options.i || args.shift() || '/dev/stdin';
var inputFormat = inferFormat(input, options['if']);

var output = options.o || args.shift() || process.stdout;
var outputFormat = inferFormat(output, options.of);

var async = require('async');
var fs = require('fs');
var read = require('./lib/read');
var write = require('./lib/write');
var template = require('./lib/template');
var groupBy = require('./lib/group-by');
var nestify = require('./');

var bail = function(error) {
  if (error) {
    console.error(error);
    process.exit(1);
    return true;
  }
};

var nestAndWrite = function(data, structure, filename, done) {
  var output = fs.createWriteStream(filename);
  var nested = nestify(structure, data);
  return write(output, nested, outputFormat, function(error) {
    bail(error) || done();
  });
};

read(config, configFormat, function(error, structure) {
  bail(error);

  read(input, inputFormat, function(error, data) {
    bail(error);

    if (options.o && template.is(options.o)) {
      var groups = groupBy(data, options.o);
      async.each(groups, function(group, done) {
        var filename = group.key;
        var values = group.values;
        console.warn('nest and write:', values.length, filename);
        nestAndWrite(values, structure, filename, done);
      }, bail);
      return;
    }

    nestAndWrite(data, structure, output, bail);
  });
});
