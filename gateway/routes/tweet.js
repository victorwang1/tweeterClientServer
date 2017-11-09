const statsd = require('../statsd.js')
const express = require('express')
const router = express.Router()
const sqs = require('../sqs.js')
const psql = require('../database/psql.js')
const bluebird = require('bluebird')
const redis = require('redis')
bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)
const client = redis.createClient()

router.get('/:tweetId', async (req, res) => {
  console.log('impression!!!');

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

  try {
    console.log('reading from cache');
    let cachedTweet = await client.hmgetAsync('id', 'userId', 'message', 'date',
    'impressions', 'views', 'likes', 'replies', 'retweets', 'type');
    console.log(cachedTweet);
  } catch (err) {
    console.log(err);
  }

  // let tweet = await psql.findTweetById(tweetId);

  res.send('hello there');

  // res.send({
  //   id: cachedTweet[0],
  //   userId: cachedTweet[1],
  //   message: cachedTweet[2],
  //   date: cachedTweet[3],
  //   impressions: cachedTweet[4],
  //   views: cachedTweet[5],
  //   likes: cachedTweet[6],
  //   replies: cachedTweet[7],
  //   retweets: cachedTweet[8],
  //   type: cachedTweet[9]
  // });

  let latency = Date.now() - start;
  statsd.timing('.read.tweet.latency_ms', latency);

  sqs.send('client', attributes, '""');

  // let publisher = await client.hgetAsync(tweetId, 'publisher');
  // // TODO if cannot find tweetId  in redis check in postgres
  // !!publisher && sqs.send('publisher', attributes, '');
})

module.exports = router
