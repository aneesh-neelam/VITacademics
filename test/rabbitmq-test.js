var jackrabbit = require('jackrabbit');

var queue = jackrabbit('amqp://localhost');

queue.on('connected', function () {
    var queues = {
        greet: 'greet',
        test: 'test'
    };
    var eachQueue = function (key) {
        var onReady = function () {
            var onJob = function (job, ack) {
                console.log(job.name);
                ack();
            };
            queue.handle(queues[key], onJob);
        };
        queue.create(queues[key], {prefetch: 1000}, onReady);
    };
    Object.keys(queues).forEach(eachQueue);
});
