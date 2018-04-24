const psql = require('./database/psql.js')
const bluebird = require('bluebird')
const redis = require('redis')
bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)
const client = redis.createClient()
const batch = require('./batch.js')

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
  impression: async ({tweetId}) => {
    batch({
      tweetId: tweetId,
      type: 'impressions'
    });

    await client.hincrbyAsync(tweetId, 'impressions', 1);
  },
  view: async ({tweetId}) => {
    batch({
      tweetId: tweetId,
      type: 'views'
    });

    await client.hincrbyAsync(tweetId, 'views', 1);
  },
  like: async ({tweetId}) => {
    batch({
      tweetId: tweetId,
      type: 'views'
    });

    await client.hincrbyAsync(tweetId, 'likes', 1);
  },
  original: async ({id, userId, createdAt, content, publisher}) => {
    batch({
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
    })

    await client.hmset(id, 'id', id,
                           'userId', userId,
                           'message', content,
                           'date', createdAt,
                           'impressions', 0,
                           'views', 0,
                           'likes', 0,
                           'replies', 0,
                           'retweets', 0,
                           'type', 'original',
                           'publisher', Number(publisher));
  },
  reply: async ({tweetId, userId, id, createdAt, content}) => {
    batch({
      id: tweetId,
      userId: userId,
      message: content,
      date: createdAt,
      impressions: 0,
      views: 0,
      likes: 0,
      replies: 0,
      retweets: 0,
      type: 'reply',
      parentId: id
    })

    await client.hmset(id, 'id', tweetId,
                           'userId', userId,
                           'message', content,
                           'date', createdAt,
                           'impressions', 0,
                           'views', 0,
                           'likes', 0,
                           'replies', 0,
                           'retweets', 0,
                           'type', 'reply',
                           'parentId', id);
  },
  retweet: async ({tweetId, userId, id, createdAt, content}) => {
    batch({
      id: tweetId,
      userId: userId,
      message: '',
      date: createdAt,
      impressions: 0,
      views: 0,
      likes: 0,
      replies: 0,
      retweets: 0,
      type: 'retweet',
      parentId: id
    })

    await client.hmset(id, 'id', tweetId,
                           'userId', userId,
                           'message', content,
                           'date', createdAt,
                           'impressions', 0,
                           'views', 0,
                           'likes', 0,
                           'replies', 0,
                           'retweets', 0,
                           'type', 'retweet',
                           'parentId', id);
  }
}
