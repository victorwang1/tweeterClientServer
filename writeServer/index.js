const Consumer = require('sqs-consumer');

const app = Consumer.create({
  queueUrl: 'https://sqs.us-east-2.amazonaws.com/675837061856/UserInput',
  batchSize: 10,
  messageAttributeNames: ['tweetId', 'type'],
  handleMessage: (message, done) => {
    console.log(message);
    done();
  }
});

app.on('error', (err) => {
  console.log(err.message);
});

app.start();
