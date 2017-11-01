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

// # Step 1. Fake a bunch of users
const fakeUsers = async (isPublisher) => {
  var batch = [];
  var userId = 1;
  while (userId < 200000) {
    if (!userId % 1000) {
      await psql.saveManyUsers(batch);
      batch = [];
    }
    batch.push(newUser(isPublisher));
  }
}

// # Step 2. Use these fake users to generate a bunch of tweets
const fakeTweets = async () => {
  var batch = [];
  var userId = 1;
  var tweetId = 1;
  while (userId < 200000) {
    if (!userId % 1000) {
      await Promise.all([
        es.writeTweetsBulk(batch).then(() => console.log(userId)),
        // psql.saveManyTweets(batch)
      ])
      endTime = currentTime + OneDay;
      batch = [];
    }
    var numOfTweets = randomNum(...tweetsPerUserRange);
    for (var i = 0; i < numOfTweets; i++) {
      var tweet = newTweet(userId, new Date(randomNum(currentTime, endTime)), "original", undefined, undefined);
      tweet.id = tweetId++;
      batch.push(tweet);
      console.log(tweetId);
    }
    userId++;
  }
}

currentTime = startDate;
var endTime = currentTime + OneWeek;

// fakeTweets();


// # Step 3. Users will randomly access tweets and follow the owner of these tweets

currentTime = startDate + OneWeek;
endTime = currentTime + OneWeek;
const simulateInteraction = async (tweetId, userId, ownerId) => {
  // simulate interactions based on user profile
  var user = await psql.findUserById(userId)
                     .then(result => result.dataValues);
  var tasks = [psql.incrementTweetImpression(tweetId)];

  user.likeProb > randomProb() && tasks.push(psql.incrementTweetLike(tweetId));
  if (user.viewProb > randomProb() && tasks.push(psql.incrementTweetView(tweetId))) {
    if (user.replyProb > randomProb()) {
      tasks.push(psql.incrementTweetReply);
      tasks.push(psql.saveOneTweet(newTweet(userId, randomNum(currentTime, endTime), "reply", "@" + ownerId, undefined)));
    }
    if (user.retweetProb > randomProb()) {
      tasks.push(psql.incrementTweetRetweet);
      tasks.push(psql.saveOneTweet(newTweet(userId, randomNum(currentTime, endTime), "retweet", undefined, tweetId)));
    }
  }

  return await Promise.all(tasks);
}

// const fakeFollows = async () => {
//   for (var userId = 1; userId <= 700000; userId++) {
//     var tweetId = randomNum(0, 1100000);
//     var ownerId = await psql.findTweetById(tweetId)
//                             .then(result => result.dataValues.userId);
//     console.log(userId);
//     await Promise.all([neo.addUser(ownerId, userId),
//                        simulateInteraction(tweetId, userId, ownerId)]).then(() => console.log(userId));
//   }
// }

const fakeFollows = async () => {
  for (let ownerId = 148413; ownerId <= 700000; ownerId++) {
    console.log('REACHED>>>>');
    let followerIdList = [];
    for (var i = 0; i < 20; i++) {
      followerIdList.push(randomNum(1, 700000));
    }
    console.log()
    await neo.batchFollow(ownerId, followerIdList).then(() => console.log(ownerId));
  }
}

// fakeFollows()

// # Step 4. Repeat step 1 to 3 and get the required 0.5M users


// # Step 5. Live incoming data -- repeat step 2 over and over again, this time
//           followers of the user will be notified and interact with the tweet
