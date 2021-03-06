const express = require('express')
const router = express.Router()
const sqs = require('../sqs.js')

router.get('/:tweetId', (req, res) => {
  let tweetId = req.params.tweetId;
  //TODO: ask for data from read server
  res.send('hey there');
})

router.post('/', (req, res) => {
  let {uuid, userId, date, message} = req.body;
  let attributes = {
    "id": {
      DataType: "String",
      StringValue: String(uuid)
    },
    "type": {
      DataType: "String",
      StringValue: "original"
    },
    "userId": {
      DataType: "String",
      StringValue: String(userId)
    },
    "createdAt": {
      DataType: "String",
      StringValue: String(date)
    }
  };

  res.sendStatus(201);
  sqs.send('client', attributes, message).then(() => {
  });
})

module.exports = router
