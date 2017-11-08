const AWS = require('aws-sdk');

AWS.config.loadFromPath('../config.json');
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});
const queueURL = {
  client: "https://sqs.us-east-2.amazonaws.com/675837061856/UserInput",
  publisher: "https://sqs.us-east-1.amazonaws.com/575799175191/tweeter"
}

const send = (queue, attributes, body) => {
  var params = {
    DelaySeconds: 0,
    MessageAttributes: attributes || {},
    MessageBody: body,
    QueueUrl: queueURL[queue]
  };

  return new Promise((resolve, reject) => {
    sqs.sendMessage(params, (err, data) => {
      if (err) {
        console.log("MessageAttributes", attributes);
        console.log('body>>>>>>>>>>', body);
        console.log("Error", err);
        reject(err);
      } else {
        console.log("Success", data.MessageId);
        resolve(data);
      }
    });
  });
}

const fetch = () => {
  var params = {
    AttributeNames: [
      "SentTimestamp"
    ],
    MaxNumberOfMessages: 1,
    MessageAttributeNames: [
      "All"
    ],
    QueueUrl: queueURL,
    VisibilityTimeout: 0,
    WaitTimeSeconds: 20
  };

  return new Promise((resolve, reject) => {
    sqs.receiveMessage(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);

        var deleteParams = {
          QueueUrl: queueURL,
          ReceiptHandle: data.Messages[0].ReceiptHandle
        };
        sqs.deleteMessage(deleteParams, (err, data) => {
          if (err) {
            console.log("Delete Error", err);
          } else {
            console.log("Message Deleted", data);
          }
        });
      }
    });
  });
}

module.exports = {
  send,
  fetch
}
