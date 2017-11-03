const express = require('express')
const router = express.Router()
const sqs = require('../sqs.js')

router.get('/:tweetId', (req, res) => {
  let tweetId = req.params.tweetId;
  //TODO: ask for data from read server
})

router.post('/', (req, res) => {
  let {tweetId, userId} = req.body;
  let attributes = {
    "tweetId": {
      DataType: "String",
      StringValue: String(tweetId)
    },
    "type": {
      DataType: "String",
      StringValue: "like"
    },
    "userId": {
      DataType: "String",
      StringValue: String(userId)
    }
  };

  res.sendStatus(201);
  
  sqs.send(attributes, '').then(() => {
  });
})

module.exports = router
