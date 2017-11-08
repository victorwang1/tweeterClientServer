const psql = require('./database/psql.js')
const bluebird = require('bluebird')
const redis = require('redis')
bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)
const client = redis.createClient()

module.exports.parseData = (data) => {
  let message = data.Body;
  let { tweetId, type, userId, id, createdAt, publisher } = data.MessageAttributes;
  // console.log(data);

  return {
    tweetId: tweetId && tweetId.StringValue,
    type: type.StringValue,
    userId: userId && userId.StringValue,
    id: id && id.StringValue,
    createdAt: createdAt && createdAt.StringValue,
    content: message,
    publisher: publisher && publisher.StringValue
  }
}

module.exports.route = {
  impression: ({tweetId}) => {
    console.log(tweetId);
    return Promise.all([
      client.hincrbyAsync(tweetId, 'impressions', 1)
            .catch(err => console.log(err)),
      psql.incrementTweetImpression(tweetId)
    ])
    .then(result => console.log('write successful!'))
    .catch(err => console.log(err))
  },
  view: ({tweetId}) => {
    console.log(tweetId);
    return Promise.all([
      client.hincrbyAsync(tweetId, 'views', 1)
            .catch(err => console.log(err)),
      psql.incrementTweetView(tweetId)
    ])
    .then(result => console.log('write successful!'))
    .catch(err => console.log(err))
  },
  like: ({tweetId}) => {
    console.log(tweetId);
    return Promise.all([
      client.hincrbyAsync(tweetId, 'likes', 1),
      psql.incrementTweetLike(tweetId)
    ])
    .then(result => console.log('write successful!'))
    .catch(err => console.log(err))
  },
  original: ({id, userId, createdAt, content, publisher}) => {
    let payload = {
      id: id,
      userId: userId,
      message: content,
      date: createdAt,
      impressions: 0,
      views: 0,
      likes: 0,
      replies: 0,
      retweets: 0,
      type: 'original',
      publisher: publisher && !!Number(publisher)
    };

    return Promise.all([
      client.multi([
        ['hset', id, 'id', id],
        ['hset', id, 'userId', userId],
        ['hset', id, 'message', content],
        ['hset', id, 'date', createdAt],
        ['hset', id, 'impressions', 0],
        ['hset', id, 'views', 0],
        ['hset', id, 'likes', 0],
        ['hset', id, 'replies', 0],
        ['hset', id, 'retweets', 0],
        ['hset', id, 'type', 'original'],
        ['hset', id, 'publisher', Number(publisher)]
      ]).execAsync(),
      psql.saveOneTweet(payload)
    ])
    .then(result => console.log('write successful!'))
    .catch(err => console.log(err));
  },
  reply: ({tweetId, userId, id, createdAt, content}) => {
    console.log(tweetId);
    let payload = {
      id: id,
      userId: userId,
      message: content,
      date: createdAt,
      impressions: 0,
      views: 0,
      likes: 0,
      replies: 0,
      retweets: 0,
      type: 'reply',
      parentId: tweetId
    };

    return Promise.all([
      client.multi([
        ['hset', id, 'id', id],
        ['hset', id, 'userId', userId],
        ['hset', id, 'message', content],
        ['hset', id, 'date', createdAt],
        ['hset', id, 'impressions', 0],
        ['hset', id, 'views', 0],
        ['hset', id, 'likes', 0],
        ['hset', id, 'replies', 0],
        ['hset', id, 'retweets', 0],
        ['hset', id, 'type', 'reply'],
        ['hset', id, 'parentId', tweetId]
      ]).execAsync(),
      psql.incrementTweetReply(id),
      psql.saveOneTweet(payload)
    ])
    .then(result => console.log('write successful!'))
    .catch(err => console.log(err));
  },
  retweet: ({tweetId, userId, id, createdAt, content}) => {
    console.log(tweetId);
    let payload = {
      id: id,
      userId: userId,
      message: '',
      date: createdAt,
      impressions: 0,
      views: 0,
      likes: 0,
      replies: 0,
      retweets: 0,
      type: 'retweet',
      parentId: tweetId
    };

    return Promise.all([
      client.multi([
        ['hset', id, 'id', id],
        ['hset', id, 'userId', userId],
        ['hset', id, 'message', content],
        ['hset', id, 'date', createdAt],
        ['hset', id, 'impressions', 0],
        ['hset', id, 'views', 0],
        ['hset', id, 'likes', 0],
        ['hset', id, 'replies', 0],
        ['hset', id, 'retweets', 0],
        ['hset', id, 'type', 'retweet'],
        ['hset', id, 'parentId', id]
      ]).execAsync(),
      psql.incrementTweetRetweet(id),
      psql.saveOneTweet(payload)
    ])
    .then(result => console.log('write successful!'))
    .catch(err => console.log(err));
  }
}
