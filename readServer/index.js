const Consumer = require('sqs-consumer');

const app = Consumer.create({
  queueUrl: 'https://sqs.us-east-2.amazonaws.com/675837061856/UserInput',
  handleMessage: (message, done) => {
    // do some work with `message`
    done();
  }
});

app.on('error', (err) => {
  console.log(err.message);
});

app.start();
