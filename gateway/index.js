const cluster = require('cluster')

if (cluster.isMaster) {

  const numWorkers = require('os').cpus().length;
  console.log('Master cluster setting up ' + numWorkers + ' workers...');

  for (var i = 0; i < numWorkers; i++) {
    cluster.fork();
  }

  cluster.on('online', function(worker) {
    console.log('Worker ' + worker.process.pid + ' is online');
  });

  cluster.on('exit', function(worker, code, signal) {
    console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
    console.log('Starting a new worker');
    cluster.fork();
  });

} else {

  const statsd = require('./statsd.js')
  const express = require('express')
  const app = express()
  const bodyParser = require('body-parser')

  const tweet = require('./routes/tweet')
  const original = require('./routes/original')
  const view = require('./routes/view')
  const like = require('./routes/like')
  const reply = require('./routes/reply')
  const retweet = require('./routes/retweet')

  app.use(bodyParser.json())

  app.use((req, res, next) => {
    statsd.increment('.gateway_requests');
    next();
  })

  app.use('/tweet', tweet)
  app.use('/original', original)
  app.use('/view', view)
  app.use('/like', like)
  app.use('/reply', reply)
  app.use('/retweet', retweet)

  app.listen(3000, () => {
    console.log('Process ' + process.pid + ' is listening on port 3000!')
  })

}
