const psql = require('./database/psql.js')
const statsd = require('./statsd.js')

var storage = {
  update: {},
  insert: []
}

const save = (update, insert) => {
  return new Promise(async (resolve, reject) => {
    try {
      await psql.saveManyTweets(insert);
      for (var tweet in update) {
        await psql.batchIncrement(update[tweet]);
      }
    } catch (err) {
      console.log(err);
      reject(err);
    }
    resolve();
  });
}

const batch = async (payload) => {
  // console.log(payload);
  let type = payload.type,
      tweetId = payload.tweetId;
  if (type === 'impressions' ||
      type === 'views' ||
      type === 'likes') {
    if (storage.update[tweetId]) {
      storage.update[tweetId][type]++;
    } else {
      storage.update[tweetId] = {
        'tweetId': tweetId,
        'impressions': 0,
        'views': 0,
        'likes': 0,
        'replies': 0,
        'retweets': 0
      }
      storage.update[tweetId][type]++;
    }
  } else if (type === 'original' ||
             type === 'reply' ||
             type === 'retweet') {

    console.log('IN STORAGE >>>>>> ', storage.insert.length);
    storage.insert.push(payload);

    if (storage.insert.length === 500) {
      let start = Date.now();

      await save(storage.update, storage.insert);
      storage.update = {};
      storage.insert = [];

      console.log('REACHED >>>>>>>>>>>>>>>>>');

      let latency = Date.now() - start;
      statsd.timing(`.write.batch.speed_ms`, latency);
    }
  }
}


module.exports = batch
