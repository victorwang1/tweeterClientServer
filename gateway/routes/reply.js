const express = require('express')
const router = express.Router()
const sqs = require('../sqs.js')

router.get('/:tweetId', (req, res) => {
  let tweetId = req.params.tweetId;
  //TODO: ask for data from read server
})

router.post('/', (req, res) => {
  let {tweetId, userId, uuid, date, message} = req.body;
  let attributes = {
    "tweetId": {
      DataType: "String",
      StringValue: String(tweetId)
    },
    "type": {
      DataType: "String",
      StringValue: "reply"
    },
    "userId": {
      DataType: "String",
      StringValue: String(userId)
    },
    "id": {
      DataType: "String",
      StringValue: String(uuid)
    },
    "createdAt": {
      DataType: "String",
      StringValue: String(date)
    }
  };

  res.sendStatus(201);
  sqs.send(attributes, message).then(() => {
  });
})

module.exports = router
