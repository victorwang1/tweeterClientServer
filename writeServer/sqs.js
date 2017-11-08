const AWS = require('aws-sdk');

AWS.config.loadFromPath('../config.json');
var sqs = new AWS.SQS({apiVersion: '2012-11-05'});

const queueURL = "https://sqs.us-east-2.amazonaws.com/675837061856/UserInput";

module.exports.fetch = () => {
  var params = {
    AttributeNames: [
      "SentTimestamp"
    ],
    MaxNumberOfMessages: 1,
    MessageAttributeNames: [
      "All"
    ],
    QueueUrl: queueURL
  };

  return new Promise((resolve, reject) => {
    sqs.receiveMessage(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        if (data.Messages && data.Messages[0]) {
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
