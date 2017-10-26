var faker = require('faker')
var newMessage = require('./generateMessage')

const newTweet = (userId, date=new Date(), type="original", at="", parentId=null, tweetId=0) => {
  return {
    "tweetId": tweetId,
    "userId": userId,
    "message": at + newMessage(),
    "date": date,
    "impressions": 0,
    "views": 0,
    "likes": 0,
    "replies": 0,
    "retweets": 0,
    "type": type,
    "parentId": parentId
  };
}

module.exports = newTweet
