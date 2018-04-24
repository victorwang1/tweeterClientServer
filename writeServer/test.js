const bluebird = require('bluebird')
const redis = require('redis')
bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)
const client = redis.createClient()

var test = async function() {
  let id = 'e3e18dd2-5d26-4060-afec-6cd90f03a501';
  await client.hmset(id, ['id', id,
                         'userId', '123123',
                         'message', '123',
                         'date', '12314241',
                         'impressions', 0,
                         'views', 0,
                         'likes', 0,
                         'replies', 0,
                         'retweets', 0,
                         'type', 'original',
                         'publisher', 1]);

  let cachedTweet = await client.hmgetAsync([id, 'userId', 'message', 'date',
  'impressions', 'views', 'likes', 'replies', 'retweets', 'type']);

  console.log(cachedTweet);
}

test();
