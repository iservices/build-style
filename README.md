# build-style

This package is currently in **BETA**

## Overview
This is a command line tool that is used to perform style compilations.
The [node-sass](https://www.npmjs.com/package/node-sass) package is used for compiling sass files into css files.

## Guide

To start you will need to install this package for your project by executing the following command within your project from the console.

```
npm install --save-dev build-style
``` 
Once the package is installed you can run the tool from a terminal using the `build-style` command.  Normally you will
do this within an npm script element.  Take the following excerpt from an example package.json file:

```JSON
{
  "scripts": {
    "style": "build-style \"src/styles/**/*\" -i src/styles -o dist -v 1.0.0 -n styles",
    "style-watch": "build-style \"src/styles/**/*\" -i src/styles -o dist -v 1.0.0 -n styles -w",
  }
}
```

In the example above the `style` script will compile all of the scss files within the `src/styles` folder and emit the result to
the `dist/1.0.0/styles` folder.
The `style-watch` script will compile the same source files whenever one of them is updated or added.

Also notice that the glob patterns are surrounded by double quotes.  This is necessary in order to prevent the terminal from expanding
the glob patterns into actual file paths.

## API

Usage:
```
build-style <files> [<files>] -o <output directory> [-i <base input directory>]
            [-m [<package.json]] [-v <version>] [-n <name>] [-w] [-k]
```
Options:

| Option | Description |
| ---    | ---         |
| `<files>` | A glob pattern that identifies files to copy.  Multiple glob patterns can be specified. |
| -i     | The base directory used when creating folder paths in the output directory.  Defaults to the current working directory. |
| -k     | When this option is specified the output folder will not be deleted before files are emitted. |
| -m     | Read in the version number from a package.json file.  If a file isn't specified the package.json in the cwd will be used. |
| -n     | A name to include in the output path |
| -o     | The directory to copy files to. |
| -v     | A version number to include in the output path. |
| -w     | When present the files specified in the -g glob pattern(s) will be watched for changes and compiled when they do change.  Additional files can be specified here as well. | 