const express = require('express')
const router = express.Router()
const sqs = require('../sqs.js')
const bluebird = require('bluebird')
const redis = require('redis')
bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)
const client = redis.createClient()


router.get('/:tweetId', (req, res) => {
  let tweetId = req.params.tweetId;
  //TODO: ask for data from read server
})

router.post('/', async (req, res) => {
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
  sqs.send('client', attributes, message);

  // let publisher = await client.hgetAsync(tweetId, 'publisher');
  // // TODO if cannot find tweetId  in redis check in postgres
  // !!publisher && sqs.send('publisher', attributes, '');
})

module.exports = router
