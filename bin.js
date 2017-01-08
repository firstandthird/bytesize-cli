'use strict';
const bytesize = require('bytesize');
const async = require('async');

const argv = require('yargs')
.usage('Usage: $0 [filename]')
.option('stringsize', {
  alias: 's',
  describe: 'get the bytesize of the input string itself, instead of interpreting it as a file path',
  default: false
})
.option('uncompressedHide', {
  alias: 'u',
  describe: 'do not show the uncompressed file size',
  default: false,
  type: 'boolean'
})
.option('compressedHide', {
  alias: 'c',
  describe: 'do not show the compressed file size',
  default: false,
  type: 'boolean'
})
.option('pretty', {
  alias: 'p',
  describe: 'print the results in a human-readable format',
  default: false,
  type: 'boolean'
})
.help()
.argv;

if (argv.stringsize) {
  return console.log('String size is %s', bytesize.stringSize(argv._.toString(), argv.pretty));
}

argv._.forEach((fileName) => {
  async.autoInject({
    gzipSize: (done) => {
      if (!argv.compressedHide) {
        return bytesize.gzipSize(fileName, argv.pretty, done);
      }
      done();
    },
    fileSize: (done) => {
      if (!argv.uncompressedHide) {
        return bytesize.fileSize(fileName, argv.pretty, done, false);
      }
      done();
    }
  }, (err, results) => {
    if (err) {
      return console.log(err)
    }
    console.log('%s:', fileName);
    if (!argv.uncompressedHide) {
      console.log('  Uncompressed size: %s', results.fileSize);
    }
    if (!argv.compressedHide) {
      console.log('    Compressed size: %s', results.gzipSize);
    }
  })
});
