var jackrabbit = require('jackrabbit');

var queue = jackrabbit('amqp://localhost');

queue.on('connected', function () {
    var name = 'vitacademics';
    var onReady = function () {
        var onJob = function (job, ack) {
            console.log(job.name);
            ack();
        };
        queue.handle(name, onJob);
    };
    queue.create(name, {prefetch: 1000}, onReady);
});
