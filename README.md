# build-style

## Overview
This is a node package that defines gulp tasks that can be used to perform style compilations.
The [node-sass](https://www.npmjs.com/package/node-sass) package is used for compiling sass files into css files.

## Guide

To install this package execute the following command in the console from within your project.

```
npm install --save build-style
```

Once the package is installed you will need to create a `gulpfile.js` file within the root folder of your project if there isn't one already.
Within this file you will register the gulp tasks that are defined within this package using the registerTasks function.  The following is an example of this.

```
'use strict';

const style = require('build-style');

style.registerTasks({
  glob: '**/*.scss',
  inputDir: 'src/styles/',
  outputDir: 'dist/styles'
});
```

Once you have registered the style tasks you can copile styles using gulp.
To compile style files simply execute the following console command from within your project.

```
gulp style
```

In addition to executing tasks from the console you can also chain the gulp style tasks together with other gulp tasks to utilize the style functionality however it's needed.

## API

### build-asset.registerTasks(options)

The registerTasks function will register 2 tasks with gulp which are named as follows:

- 'style' - This task will compile styles.
- 'watch-style' - This is a long running task that will listen for changes to files.  When a file is changed styles will be recompiled.

#### options

Type: `Object`

This parameter is an object that holds the various options to use when registering the tasks.

#### options.glob

Type: `String` or `Array`

A glob or array of globs relative to the options.inputDir parameter that identify the style files in your project that that will be compiled. 
Use [node-glob syntax](https://github.com/isaacs/node-glob) when specifying patterns.

#### options.inputDir

Type: `String`

The directory that contains all of the style files that will be compiled.

#### options.outputDir

Type: `String`

The directory that compiled style files will be output to.  The folder structure from the options.inputDir folder will be recreated in this folder.

#### options.tasksPrefix

Type: `String`

This is an optional parameter that when set will add a prefix to the names of the tasks that get registered. For example, if tasksPrefix is set to 'hello' then the task that would have been registered with the name 'style' will be registered with the name 'hello-style' instead.