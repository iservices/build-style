/* eslint no-console:0,object-shorthand:0 */
'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const rename = require('gulp-rename');
const minifyCss = require('gulp-minify-css');
const watch = require('gulp-watch');
const gulpIf = require('gulp-if');
const del = require('del');

/**
 * Transform the given sass files into css files.
 *
 * @param {object} opts - An options object.
 * @param {object} opts.input - Input arguments.
 * @param {boolean} opts.minify - If true the output will be minified.
 * @param {function} opts.errorHandler - Optional error handler that gets called when an error occurs.
 * @returns {stream} A stream that transforms the files.
 */
function transform(opts) {
  return gulp.src(opts.input.glob)
    .pipe(sass())
    .on('error', function transformError(err) {
      if (opts.errorHandler) {
        opts.errorHandler(err);
      } else {
        throw err;
      }
    })
    .pipe(gulpIf(opts.minify, minifyCss()))
    .pipe(gulpIf(opts.minify, rename({ extname: '.min.css' })))
    .pipe(gulp.dest(opts.input.outputDir));
}

/**
  * This function is used to notify developers of an error that occured
  * as a result of a changed file.
  *
  * @param {Error} err - The error to notify the user about.
  * @param {string} title - The title for the notification window.
  * @param {string} message - The message to display in the notification window.
  * @returns {void}
  */
function notify(err, title, message) {
  require('node-notifier').notify({
    title: title,
    message: message
  });

  if (err) {
    if (err.message) {
      console.log(err.message);
    } else {
      console.log(err);
    }
  }
}

/**
 * Register style transform tasks.
 *
 * @param {object} opts - The configuration options.
 * @param {string|string[]} opts.glob - The style files to transform.
 * @param {string} opts.outputDir - The output for the created files.
 * @param {string} [opts.tasksPrefix] - An optional prefix to apply to task names.
 * @returns {function} - A function that registers tasks.
 */
module.exports = function registerTasks(opts) {
  const input = {
    glob: opts.glob,
    outputDir: opts.outputDir
  };

  if (opts.tasksPrefix) {
    input.tasksPrefix = opts.tasksPrefix + '-';
  } else {
    input.tasksPrefix = '';
  }

  /**
   * Process the style files.
   */
  gulp.task(input.tasksPrefix + 'style', function styleTask(done) {
    del.sync(input.outputDir);

    let completeCount = 0;
    const complete = function complete() {
      completeCount++;
      if (completeCount >= 2) {
        done();
      }
    };

    transform({ minify: false, input: input }).on('end', complete);
    transform({ minify: true, input: input }).on('end', complete);
  });

  /**
   * Watch for changes to style.
   */
  gulp.task(input.tasksPrefix + 'watchStyle', function watchStyleTask() {
    watch(input.glob, function watchStyle(file) {
      console.log('watch style: ' + file.path + ' event: ' + file.event);
      let errorDisplayed = false;
      const errorHandler = function errorHandler(err) {
        if (!errorDisplayed) {
          errorDisplayed = true;
          notify(err, 'Style Error', 'See console for details.');
        }
      };

      del.sync(input.outputDir);
      transform({ input: input, minify: false, errorHandler: errorHandler });
      transform({ input: input, minify: true, errorHandler: errorHandler });
    });
  });
};
