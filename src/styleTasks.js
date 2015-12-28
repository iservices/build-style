/* eslint no-console:0,object-shorthand:0 */
'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const rename = require('gulp-rename');
const minifyCss = require('gulp-minify-css');
const watch = require('gulp-watch');
const gulpIf = require('gulp-if');
const del = require('del');
const path = require('path');

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
    .on('error', function (err) {
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
 * @param {string} opts.inputDir - The directory that contains the styles.
 * @param {string|string[]} opts.glob - Glob pattern relative to the inputDir that identifies the style files to transform.
 * @param {string} opts.outputDir - The output for the created files.
 * @param {string} [opts.tasksPrefix] - An optional prefix to apply to task names.
 * @returns {function} - A function that registers tasks.
 */
module.exports = function registerTasks(opts) {
  let globParam = null;
  if (Array.isArray(opts.glob)) {
    globParam = opts.glob.map(function (value) {
      if (value[0] === '!') {
        return '!' + path.normalize(opts.inputDir + '/' + value.slice(1));
      }
      return path.normalize(opts.inputDir + '/' + value);
    });
  } else {
    if (opts.glob[0] === '!') {
      globParam = '!' + path.normalize(opts.inputDir + '/' + opts.glob.slice(1));
    } else {
      globParam = path.normalize(opts.inputDir + '/' + opts.glob);
    }
  }
  
  const input = {
    glob: globParam,
    inputDir: opts.inputDir,
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
  gulp.task(input.tasksPrefix + 'style', function (done) {
    del.sync(input.outputDir);

    let completeCount = 0;
    const complete = function () {
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
  gulp.task(input.tasksPrefix + 'watch-style', function () {
    watch(input.glob, function (file) {
      console.log('watch style: ' + file.path + ' event: ' + file.event);
      let errorDisplayed = false;
      const errorHandler = function (err) {
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
