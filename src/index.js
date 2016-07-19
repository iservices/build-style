#!/usr/bin/env node

'use strict';

const globby = require('globby');
const del = require('del');
const fs = require('fs');
const spawn = require('cross-spawn');
const chokidar = require('chokidar');
const path = require('path');
const argsv = require('minimist')(process.argv.slice(2));

/**
 * Format the target output directory.
 *
 * @ignore
 * @param {Object} args - The arguments passed into the command line.
 * @return {String} The formatted target directory path.
 */
function formatTarget(args) {
  let target = args.o;
  if (args.v) {
    target = path.join(target, args.v);
  }
  if (args.n) {
    target = path.join(target, args.n);
  }
  return target;
}

/**
 * Compile the sass files.
 *
 * @ignore
 * @param {String[]} files - The files to compile.
 * @param {Object} args - The arguments passed into the command line.
 * @return {void}
 */
function compile(files, args) {
  const targetDir = formatTarget(args);
  const cwd = process.cwd();
  let base = cwd;
  if (args.i) {
    if (path.isAbsolute(args.i)) {
      base = args.i;
    } else {
      base = path.join(cwd, args.i);
    }
  }

  files.forEach(f => {
    let file = f;
    if (!path.isAbsolute(file)) {
      file = path.join(cwd, file);
    }
    const input = [];
    input.push(file);
    input.push('-o');
    input.push(path.dirname(path.join(targetDir, file.slice(base.length))));
    input.push('--output-style');
    input.push('compressed');
    input.push('--source-map');
    input.push('true');

    spawn('node-sass', input, { stdio: 'inherit' })
      .on('exit', code => {
        if (code) {
          process.exitCode = code;
        }
      });
  });
}

/**
 * Watch for changes to the given files and compile them when they do change.
 *
 * @ignore
 * @param {Object} args - The arguments passed into the command line.
 * @return {void}
 */
function compileWatch(args) {
  if (args._.length) {
    const patterns = [];
    Array.prototype.push.apply(patterns, args._);
    if (Array.isArray(args.w)) Array.prototype.push.apply(patterns, args.w);
    else if (typeof args.w === 'string') patterns.push(args.w);
    const watcher = chokidar.watch(patterns, {
      ignored: /[\/\\]\./,
      persistent: true
    });
    watcher.on('ready', () => {
      watcher.on('add', () => {
        globby(args._).then(files => {
          compile(files, args);
        });
      });
      watcher.on('change', () => {
        globby(args._).then(files => {
          compile(files, args);
        });
      });
    });
  }
}

// get version from package.json
if (argsv.m && !argsv.v) {
  try {
    argsv.v = (typeof argsv.m === 'string') ?
      JSON.parse(fs.readFileSync(argsv.m)).version :
      JSON.parse(fs.readFileSync('./package.json')).version;
  } catch (err) {
    console.error(err);
    return 1;
  }
}

if (!argsv._.length) {
  //
  // print help info if args are missing
  //
  console.log('Usage: build-style <files> [<files>] -o <output directory> [-i <base input directory>]');
  console.log('                   [-m [<package.json]] [-v <version>] [-n <name>] [-w]');
  console.log('');
  console.log('Options:');
  console.log('<files>\t A glob pattern that identifies files to compile.  Multiple glob patterns can be specified.');
  console.log('-i\t The base directory used when creating folder paths in the output directory.  Defaults to the current working directory.');
  console.log('-k\t When this option is specified the output folder will not be deleted before files are emitted.');
  console.log('-m\t Read in the version number from a package.json file.  If a file isn\'t specified the package.json in the cwd will be used.');
  console.log('-n\t A name to include in the output path');
  console.log('-o\t The directory to copy files to.');
  console.log('-v\t A version number to include in the output path.');
  console.log('-w\t When present the files specified in the -g glob pattern(s) will be watched for changes and compiled when they do change.  Additional files can be specified here as well.');
  process.exitCode = 1;
} else if (argsv.w) {
  //
  // watch for changes
  //
  compileWatch(argsv);
} else {
  //
  // compile files specified
  //
  if (!argsv.k) {
    del.sync(formatTarget(argsv));
  }
  globby(argsv._).then(files => {
    compile(files, argsv);
  });
}
