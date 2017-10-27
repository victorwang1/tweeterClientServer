const newUser = require('./generateUser.js')
const newTweet = require('./generateTweet.js')
const db = require('./database/index.js')
const psql = require('./index.js')

const randomNum = (min = 0, max = 100) => Math.floor(Math.random() * (max - min))  + min;
const randomProb = (min = 0, max = 1) => Math.random() * (max - min) + min;
const randomElement = array => array[Math.floor(Math.random() * array.length)];

const numOfUsers = 100;
const tweetsPerUserRange = [2, 10];
const numOfImpressionsRange = [20, 100];
const startDate = new Date(2017, 7, 1).valueOf();
const endDate = new Date(2017, 9, 24).valueOf();
const oneWeek = 6.048e+8;
const tenMinutes = 600000;

var currentTime = startDate;
var tweetCount = 0;
var userCount = 0;



// # Step 1. Fake a bunch of users
var fakeUserList = [];
var fakeUserObj = {};
var fakeUsers = (isPublisher=false) => {
  for (var i = 0; i < numOfUsers; i++) {
    var user = newUser(isPublisher);
    fakeUserList.push(user);
    fakeUserObj[user.handle] = user;
  }
}


// # Step 2. Use these fake users to generate a bunch of tweets
var fakeTweetList = [];
var fakeTweets = (callback) => {
  fakeUserList.forEach(user => {
    var numOfTweets = randomNum(...tweetsPerUserRange);
    for (var i = 0; i < numOfTweets; i++) {
      var tweet = newTweet(user.handle, randomNum(currentTime, endTime), "original", undefined, undefined, tweetCount++);
      fakeTweetList.push(tweet);
      callback && callback(tweet, user);
    }
  })
}


// # Step 3. Users will randomly access tweets and follow the owner of these tweets

var followingStageEnd = currentTime + oneWeek;

var count = 0;
var simulateInteraction = (tweet, user) => {
  // simulate interactions based on user profile
  tweet.impressions++;
  user.likeProb > randomProb() && tweet.likes++;
  if (user.viewProb > randomProb() && tweet.views++) {
    if (user.replyProb > randomProb()) {
      fakeTweetList.push(newTweet(user.handle, randomNum(currentTime, endTime), "reply", "@" + tweet.userId, undefined, tweetCount++));
      count++;
    }
    if (user.retweetProb > randomProb()) {
      fakeTweetList.push(newTweet(user.handle, randomNum(currentTime, endTime), "retweet", undefined, tweet.tweetId, tweetCount++));
      count++;
    }
  }
}

var fakeFollows = () => {
  fakeUserList.forEach(user => {
    var numOfImpressions = randomNum(...numOfImpressionsRange);
    for (var i = 0; i < numOfImpressions; i++) {
      var tweet = randomElement(fakeTweetList);
      var owner = fakeUserObj[tweet.userId];

      simulateInteraction(tweet, user);

      // establish following/follower relationship
      user.followings.push(owner);
      owner.followers.push(user);
    }
  })
}
// fakeFollows();
// currentTime = followingStageEnd;

// # Step 4. Repeat step 1 to 3 and get the required 0.5M users

// var currentTime = startDate;
// for (var i = 0; i <= 20000; i++) {
//   fakeUsers();
//   userCount += 100;
//   var endTime = currentTime + tenMinutes;
//   fakeTweets();
//   var endTime = currentTime + tenMinutes;
//   fakeFollows();
//
//   var fakeUserList = [];
//   for (var user in fakeUserObj) {
//     fakeUserList.push(fakeUserObj[user]);
//   }
//   db.saveUsers(fakeUserList);
//   db.saveTweets(fakeTweetList);
//   console.log('There are ' + tweetCount + ' tweets!');
// }

psql.saveOneUser(newUser());

// # Step 5. Live incoming data -- repeat step 2 over and over again, this time
//           followers of the user will be notified and interact with the tweet

// currentTime = currentTime + oneWeek;
// fakeTweets(simulateInteraction);
