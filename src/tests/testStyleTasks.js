/* eslint-env node, mocha */
'use strict';

const gulp = require('gulp');
const del = require('del');
const path = require('path');
const fs = require('fs');

/**
 * Unit tests for registerTasks function.
 */
describe('registerTasks', function () {
  gulp.on('stop', function () {
    process.exit(0); // need this call to end long running watch process
  });

  it('simple task setup works as expected.', function (done) {
    del.sync(path.normalize(__dirname + '/../../testOutput/simple/'));
    require(__dirname + '/fixtures/simple/gulpfile');
    gulp.on('task_stop', function (e) {
      if (e.task === 'simple-style') {
        fs.statSync(__dirname + '/../../testOutput/simple/log/styles.css');
        fs.statSync(__dirname + '/../../testOutput/simple/log/styles.min.css');
        done();
      }
    });
    gulp.start('simple-style');
  });

  it('simple watch task setup works as expected.', function (done) {
    this.timeout(8000);

    del.sync(path.normalize(__dirname + '/../../testOutput/watch/'));
    require(__dirname + '/fixtures/watch/gulpfile');
    gulp.on('task_stop', function (e) {
      if (e.task === 'watch-watch-style') {
        const text = fs.readFileSync(__dirname + '/fixtures/watch/chat/log/styles.scss', 'utf8');
        fs.writeFileSync(__dirname + '/fixtures/watch/chat/log/styles.scss', text);
        setTimeout(function (finish) {
          fs.statSync(__dirname + '/../../testOutput/watch/log/styles.css');
          fs.statSync(__dirname + '/../../testOutput/watch/log/styles.min.css');
          finish();
        }, 4000, done);
      }
    });
    gulp.start('watch-watch-style');
  });
});
