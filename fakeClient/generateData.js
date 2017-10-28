const newUser = require('./generateUser.js')
const newTweet = require('./generateTweet.js')
const db = require('./database/psql.js')
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
var fakeUserList = [];
// var fakeUserObj = {};
var fakeUsers = (isPublisher) => {
  for (var i = 0; i < numOfUsers; i++) {
    var user = newUser(isPublisher);
    fakeUserList.push(user);
    // fakeUserObj[user.handle] = user;
  }
}


// # Step 2. Use these fake users to generate a bunch of tweets
var fakeTweets = async () => {
  var batch = [];
  var userId = 1;
  var tweetId = 1;
  while (userId < 200000) {
    if (userId % 1000 === 0) {
      await Promise.all([
        es.writeTweetsBulk(batch).then(() => console.log(userId)),
        // db.saveManyTweets(batch)
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

fakeTweets();

// # Step 3. Users will randomly access tweets and follow the owner of these tweets

currentTime = startDate + OneWeek;
endTime = currentTime + OneWeek;
var simulateInteraction = async (tweetId, userId, ownerId) => {
  // simulate interactions based on user profile
  var user = await db.findUserById(userId)
                     .then(result => result.dataValues);
  var tasks = [db.incrementTweetImpression(tweetId)];

  user.likeProb > randomProb() && tasks.push(db.incrementTweetLike(tweetId));
  if (user.viewProb > randomProb() && tasks.push(db.incrementTweetView(tweetId))) {
    if (user.replyProb > randomProb()) {
      tasks.push(db.incrementTweetReply);
      tasks.push(db.saveOneTweet(newTweet(userId, randomNum(currentTime, endTime), "reply", "@" + ownerId, undefined)));
    }
    if (user.retweetProb > randomProb()) {
      tasks.push(db.incrementTweetRetweet);
      tasks.push(db.saveOneTweet(newTweet(userId, randomNum(currentTime, endTime), "retweet", undefined, tweetId)));
    }
  }

  return await Promise.all(tasks);
}

var fakeFollows = async () => {
  for (var userId = 200000; userId <= 700000; userId++) {
    var tweetId = randomNum(0, 1100000);
    var ownerId = await db.findTweetById(tweetId)
                          .then(result => result.dataValues.userId);
    console.log(userId);
    await Promise.all([neo.addUser(ownerId, userId),
                       simulateInteraction(tweetId, userId, ownerId)])
                 .then(() => console.log(userId));
  }
}

// # Step 4. Repeat step 1 to 3 and get the required 0.5M users

// ####### Fake User #######
// for (var i = 0; i < 1000; i++) {
//   fakeUsers(false);
//   userCount += 100;
//   var endTime = currentTime + TenMinutes;
//   db.saveManyUsers(fakeUserList);
//   fakeUserList = [];
//   console.log('There are ' + userCount + ' users!');
// }
// ####### Fake User #######

// ####### Fake Tweets #######
// currentTime = startDate;
// var endTime = currentTime + FourDays;
// fakeTweets((tweets) => {
//   currentTime += FourDays;
//   endTime += FourDays;
//   console.log('>>>>>>>>>>>');
//   // console.log(tweets);
//   db.saveManyTweets(tweets);
// });
// ####### Fake Tweets #######

// ####### Fake Follows #######
// fakeFollows();
// ####### Fake Follows #######


// # Step 5. Live incoming data -- repeat step 2 over and over again, this time
//           followers of the user will be notified and interact with the tweet

// currentTime = currentTime + OneWeek;
// fakeTweets(simulateInteraction);
