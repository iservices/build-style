const style = require('../../../index');

style.registerTasks({
  glob: '**/*.scss',
  inputDir: __dirname + '/chat/',
  outputDir: __dirname + '/../../../../testOutput/simple/',
  tasksPrefix: 'simple'
});
