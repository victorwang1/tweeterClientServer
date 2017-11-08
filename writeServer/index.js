const statsd = require('./statsd.js')
const sqs = require('./sqs.js')
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

  const listen = async () => {
    let { Messages } = await sqs.fetch();
    if (Messages) {
      let start = Date.now();
      let payload = parseData(Messages[0]);

      await route[payload.type](payload);

      let latency = Date.now() - start;
      statsd.timing(`.write.speed_ms`, latency);
      statsd.timing(`.write.${payload.type}.speed_ms`, latency);
    }

  }

  setInterval(listen, 100);

  console.log(`Worker ${process.pid} started`);
}
