var forever = require('forever-monitor');

var child = new (forever.Monitor)('./bin/www', {
    max: 3,
    silent: true,
    options: []
});

child.on('exit', function () {
    console.log('Express server exited after 3 retries');
});

child.start();