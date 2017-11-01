const faker = require('faker')
const newMessage = require('./generateMessage')
const uuidv4 = require('uuid/v4');

const newTweet = (userId, date=new Date().valueOf(), type="original", at="", parentId=null) => {
  return {
    "uuid": uuidv4(),
    "userId": userId,
    "message": at + newMessage(),
    "date": String(date),
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
