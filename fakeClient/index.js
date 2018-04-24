const newUser = require('./generateUser.js')
const axios = require('axios')
const newTweet = require('./generateTweet.js')
const Queue = require('./helpers/queue.js')
const neo4j = require('./database/neo4j.js')
const psql = require('./database/psql.js')
const url = 'http://localhost:3000'


const batchesPerSecond = 10;
const numOfTweetsRange = [2, 10];
const interval = 1000 / batchesPerSecond;

const randomNum = (min = 0, max = 100) => Math.floor(Math.random() * (max - min)) + min;
const randomProb = (min = 0, max = 1) => Math.random() * (max - min) + min;
const formatAction = (type, tweetId, userId) => ({
  tweetId: String(tweetId),
  type: type,
  userId: String(userId)
})

const get = tweetId => axios.get(url + '/tweet/' + tweetId)
                            .catch(err => console.log(err));
const post = tweet => {
  let endpoint = url;
  let type = tweet.type;

  if (type === 'original') endpoint += '/original/';
  else if (type === 'view') endpoint += '/view/';
  else if (type === 'like') endpoint += '/like/';
  else if (type === 'reply') endpoint += '/reply/';
  else if (type === 'retweet') endpoint += '/retweet/';

  console.log(type);

  return axios.post(endpoint, tweet).then(() => {
  });
}

const interact = async (ownerId, tweetId) => {
  // let followers = await neo4j.getFollowers(ownerId);
  let followers = [];
  for (var i = 0; i < 10; i++) {
    followers.push(randomNum(1, 697998));
  }

  await get(tweetId).then(() => console.log("impression!!!"));

  followers.forEach(async userId => {

    // let user = await psql.findUserById(userId);
    let user = newUser(false);

    user.likeProb > randomProb() && post(formatAction('like', tweetId, userId)).then(() => console.log("like!!!"));
    if (user.viewProb > randomProb() && post(formatAction('view', tweetId, userId))) {
      if (user.replyProb > randomProb()) {
        let tweet = newTweet(userId, new Date().valueOf(), "reply", "@" + ownerId, undefined);
        tweet.tweetId = tweetId;
        await post(tweet).then(() => console.log("reply!!!"));

        interact(userId, tweet.uuid);
      }
      if (user.retweetProb > randomProb()) {
        let tweet = newTweet(userId, new Date().valueOf(), "retweet", undefined, tweetId);
        tweet.tweetId = tweetId;
        await post(tweet).then(() => console.log("retweet!!!"));

        interact(userId, tweet.uuid);
      }
    }

  })
}

const simulate = async () => {
  let batch = [];
  let userId = randomNum(1, 200000);
  let numOfTweets = randomNum(...numOfTweetsRange);

  for (var i = 0; i < 10; i++) {
    // batch.push(post(newTweet(userId)));
    let tweet = newTweet(userId);
    await post(tweet).then(() => console.log("new tweet!!!"));

    interact(userId, tweet.uuid);
  }
}

setInterval(simulate, 5000)
