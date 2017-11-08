const AWS = require('aws-sdk');

AWS.config.loadFromPath('../config.json');
var sqs = new AWS.SQS({apiVersion: '2012-11-05'});

const clientQueueURL = "https://sqs.us-east-2.amazonaws.com/675837061856/UserInput";
const publisherQueueURL = "https://sqs.us-east-1.amazonaws.com/575799175191/tweeter";

module.exports.send = (attributes, body) => {
  var params = {
    MessageAttributes: attributes || {},
    MessageBody: body,
    QueueUrl: clientQueueURL
  };

  return new Promise((resolve, reject) => {
    sqs.sendMessage(params, (err, data) => {
      if (err) {
        console.log("Error", err);
        reject(err);
      } else {
        console.log("Success", data.MessageId);
        resolve(data);
      }
    });
  });
}

module.exports.fetch = () => {
  var params = {
    AttributeNames: [
      "SentTimestamp"
    ],
    MaxNumberOfMessages: 1,
    MessageAttributeNames: [
      "All"
    ],
    QueueUrl: publisherQueueURL
  };

  return new Promise((resolve, reject) => {
    sqs.receiveMessage(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        if (data.Messages) {
          var deleteParams = {
            QueueUrl: queueURL,
            ReceiptHandle: data.Messages[0].ReceiptHandle
          };
          sqs.deleteMessage(deleteParams, (err, result) => {
            if (err) {
              console.log("Delete Error", err);
            } else {
              resolve(data);
              console.log("Message Deleted", result);
            }
          });
        } else {
          resolve({});
        }
      }
    });
  });
}
