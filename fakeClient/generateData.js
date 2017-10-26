const newUser = require('./generateUser.js')
const newTweet = require('./generateTweet.js')
const db = require('./database/index.js')

const randomNum = (min = 0, max = 100) => Math.floor(Math.random() * (max - min))  + min;
const randomProb = (min = 0, max = 1) => Math.random() * (max - min) + min;
const randomElement = array => array[Math.floor(Math.random() * array.length)];

const numOfUsers = 5000;
const tweetsPerUserRange = [2, 10];
const numOfImpressionsRange = [20, 100];
const startDate = new Date(2017, 7, 1).valueOf();
const endDate = new Date(2017, 9, 24).valueOf();
const oneWeek = 6.048e+8;

var currentTime = startDate;
var tweetCount = 0;

// # Step 1. Fake a bunch of users
var fakeUserList = [];
var fakeUserObj = {};
var fakeUsers = () => {
  for (var i = 0; i < numOfUsers; i++) {
    var user = newUser();
    fakeUserList.push(user);
    fakeUserObj[user.handle] = user;
  }
}
// fakeUsers();


// # Step 2. Use these fake users to generate a bunch of tweets
var fakeTweetList = [];
var initialStageEnd = startDate + oneWeek;
var fakeTweets = (callback) => {
  fakeUserList.forEach(user => {
    var numOfTweets = randomNum(...tweetsPerUserRange);
    for (var i = 0; i < numOfTweets; i++) {
      var tweet = newTweet(user.handle, randomNum(currentTime, initialStageEnd), "original", undefined, undefined, tweetCount++);
      fakeTweetList.push(tweet);
      callback && callback(tweet, user);
    }
  })
}
// fakeTweets();
currentTime = initialStageEnd;


// # Step 3. Users will randomly access tweets and follow the owner of these tweets

var followingStageEnd = currentTime + oneWeek;

var count = 0;
var simulateInteraction = (tweet, user) => {
  // simulate interactions based on user profile
  tweet.impressions++;
  user.likeProb > randomProb() && tweet.likes++;
  if (user.viewProb > randomProb() && tweet.views++) {
    if (user.replyProb > randomProb()) {
      fakeTweetList.push(newTweet(user.handle, randomNum(currentTime, initialStageEnd), "reply", "@" + tweet.userId, undefined, tweetCount++));
      count++;
    }
    if (user.retweetProb > randomProb()) {
      fakeTweetList.push(newTweet(user.handle, randomNum(currentTime, initialStageEnd), "retweet", undefined, tweet.tweetId, tweetCount++));
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

var fakeUserList = [];
// for (var user in fakeUserObj) {
//   fakeUserList.push(fakeUserObj[user]);
// }
// db.saveUsers(fakeUserList);
// db.saveTweets(fakeTweetList);

// # Step 4. Repeat step 2 over and over again, this time followers of the user
//           will be notified and interact with the tweet

fakeUsers();
fakeTweets();
// currentTime = startDate + oneWeek;
fakeFollows();
console.log('There are ' + count + 'retweets and replies!');
// currentTime = currentTime + oneWeek;
// fakeTweets(simulateInteraction);
