const axios = require('axios')
const statsd = require('./statsd.js')
const sqs = require('./sqs.js')
const cluster = require('cluster')
const numCPUs = require('os').cpus().length

const gatewayEndpoint = 'http://localhost:3000/publisher'

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

      let message = Messages[0];
      message.MessageAttributes['publisher'] = {
        DataType: "String",
        StringValue: '1'
      };
      sqs.send(message.MessageAttributes, message.Body);

      // TODO add to gateway publisher tweet list
      axios.post(gatewayEndpoint, {tweetId: message.MessageAttributes.id.StringValue});

      // TODO notify client new tweet is available (through socket.io)

    }
  }

  setInterval(listen, 200);

  console.log(`Worker ${process.pid} started`);
}
