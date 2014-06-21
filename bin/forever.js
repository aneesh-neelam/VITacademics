var forever = require('forever-monitor');
var debug = require('debug')('VITacademics');

var child = new (forever.Monitor)('./bin/www', {
    max: 3,
    silent: true,
    options: []
});

child.on('exit', function ()
{
    debug('VITacademics exited after 3 retries');
});

child.start();