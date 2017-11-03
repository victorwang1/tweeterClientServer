const statsd = require('./statsd.js')
const sqs = require('../sqs/index.js')
const parseData = require('./helpers.js').parseData
const route = require('./helpers.js').route
const Consumer = require('sqs-consumer')
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });

} else {

  const app = Consumer.create({
    queueUrl: 'https://sqs.us-east-2.amazonaws.com/675837061856/UserInput',
    messageAttributeNames: ['All'],
    waitTimeSeconds: 0,
    handleMessage: async (message, done) => {
      if (message.MessageAttributes.type.StringValue === 'impression') {
        done();
        return;
      }
      let start = Date.now();
      let payload = parseData(message);

      done();
      await route[payload.type](payload);

      let latency = Date.now() - start;
      statsd.timing(`.write.latency_ms`, latency);
      statsd.timing(`.write.${payload.type}.latency_ms`, latency);
    }
  });

  app.on('error', (err) => {
    console.log(err.message);
  });

  app.start();

  console.log(`Worker ${process.pid} started`);
}

const listen = () => {
  sqs.fetch().then(data => {
    if (data.Message) {
      let payload = parseData(data);
    }

    console.log(data);
  })
}

setInterval(listen, 10);
