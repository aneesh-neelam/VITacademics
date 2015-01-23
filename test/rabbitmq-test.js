var jackrabbit = require('jackrabbit');

var amqpUri = process.env.AMQP_URI || 'amqp://localhost';
var queue = jackrabbit(amqpUri);

queue.on('connected', function () {
    var name = 'VITacademics';
    var onReady = function () {
        var onJob = function (job, ack) {
            console.log(job.name);
            ack();
        };
        queue.handle(name, onJob);
    };
    queue.create(name, {prefetch: 1000}, onReady);
});
