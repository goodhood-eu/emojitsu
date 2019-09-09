const fs = require('fs');

const { logError } = require('./tasks/utils/log');

const taskName = process.argv[2];
if (!taskName) { logError('Specify a task to run, e.g.: sitemap'); }

const taskPath = `./tasks/${taskName}.js`;
if (!fs.existsSync(taskPath)) logError('Task doesn\'t exist');

const taskFn = require(taskPath);
if (typeof taskFn !== 'function') { logError('Not a valid task'); }

const options = process.argv.slice(3);
taskFn(...options);
