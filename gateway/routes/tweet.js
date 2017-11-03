const statsd = require('../statsd.js')
const express = require('express')
const router = express.Router()
const sqs = require('../sqs.js')
const psql = require('../database/psql.js')

router.get('/:tweetId', (req, res) => {
  let start = Date.now();

  let tweetId = req.params.tweetId;
  let attributes = {
    "tweetId": {
      DataType: "String",
      StringValue: tweetId
    },
    "type": {
      DataType: "String",
      StringValue: "impression"
    }
  };

  sqs.send(attributes, '').then(() => {
    console.log('message in queue!');
  });

  psql.findTweetById(tweetId)
      .then(tweet => {
        let latency = Date.now() - start;
        statsd.timing('.read.tweet.latency_ms', latency);
        res.send(tweet);
      })
      .catch(err => console.log(err));
})

module.exports = router
