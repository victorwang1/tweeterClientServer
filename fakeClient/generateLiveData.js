const newUser = require('./generateUser.js')
const newTweet = require('./generateTweet.js')
const psql = require('./database/psql.js')
const neo = require('./database/neo4j.js')
const es = require('./database/es.js')

const randomNum = (min = 0, max = 100) => Math.floor(Math.random() * (max - min))  + min;
const randomProb = (min = 0, max = 1) => Math.random() * (max - min) + min;
const randomElement = array => array[Math.floor(Math.random() * array.length)];

const numOfUsers = 100;
const tweetsPerUserRange = [2, 10];
const numOfImpressionsRange = [20, 100];
const startDate = new Date(2017, 7, 1).valueOf();
const endDate = new Date(2017, 9, 24).valueOf();
const OneWeek = 6.048e+8;
const OneDay = 8.64e+7;
const FourDays = 3.456e+8;
const TenMinutes = 600000;

var currentTime = startDate;
var tweetCount = 0;
var userCount = 0;

const simulateInteraction = async (tweetId, userId, ownerId) => {
  var tasks = [psql.incrementTweetImpression(tweetId)];

  user.likeProb > randomProb() && tasks.push(psql.incrementTweetLike(tweetId));
  if (user.viewProb > randomProb() && tasks.push(psql.incrementTweetView(tweetId))) {
    if (user.replyProb > randomProb()) {
      tasks.push(psql.incrementTweetReply);
      tasks.push(psql.saveOneTweet(newTweet(userId, new Date(), "reply", "@" + ownerId, undefined)));
    }
    if (user.retweetProb > randomProb()) {
      tasks.push(psql.incrementTweetRetweet);
      tasks.push(psql.saveOneTweet(newTweet(userId, new Date(), "retweet", undefined, tweetId)));
    }
  }

  return await Promise.all(tasks);
}


module.exports = {
  simulateInteraction
}
