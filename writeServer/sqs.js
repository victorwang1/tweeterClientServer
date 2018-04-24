const AWS = require('aws-sdk');

AWS.config.loadFromPath('../config.json');
var sqs = new AWS.SQS({apiVersion: '2012-11-05'});

const queueURL = "https://sqs.us-east-2.amazonaws.com/675837061856/UserInput";

module.exports.fetch = () => {
  var params = {
    AttributeNames: [
      "SentTimestamp"
    ],
    MaxNumberOfMessages: 10,
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
        if (data.Messages && data.Messages.length) {
          // console.log(data.Messages);
          resolve(data);
          let deleteParams = {
            Entries: data.Messages.map(message => (
              {
                Id: message.MessageId,
                ReceiptHandle: message.ReceiptHandle
              }
            )),
            QueueUrl: queueURL
          };
          sqs.deleteMessageBatch(deleteParams, (err, result) => {
            if (err) console.log(err, err.stack); // an error occurred
            // else     console.log(data);           // successful response
          });
        } else {
          resolve({});
        }
      }
    });
  });
}
