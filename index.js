let args = require('minimist')(process.argv);

require('./app/config/server')(args);
