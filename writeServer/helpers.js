const psql = require('./database/psql.js')

module.exports.parseData = (data) => {
  let message = data.Body;
  let { tweetId, type, userId, id, createdAt } = data.MessageAttributes;
  return {
    tweetId: tweetId.StringValue,
    type: type.StringValue,
    userId: userId.StringValue,
    id: id && id.StringValue,
    createdAt: createdAt && createdAt.StringValue,
    content: message
  }
}

module.exports.route = {
  view: ({tweetId}) => psql.incrementTweetView(tweetId),
  like: ({tweetId}) => psql.incrementTweetLike(tweetId),
  original: ({tweetId, userId, createdAt, content}) => {
    return psql.saveOneTweet({
      id: tweetId,
      userId: userId,
      message: content,
      date: createdAt,
      impressions: 0,
      views: 0,
      likes: 0,
      replies: 0,
      retweets: 0,
      type: 'original'
    }).catch(err => console.log(err))
  },
  reply: ({tweetId, userId, id, createdAt, content}) => {
    return Promise.all([
      psql.incrementTweetReply(id),
      psql.saveOneTweet({
        id: tweetId,
        userId: userId,
        message: content,
        date: createdAt,
        impressions: 0,
        views: 0,
        likes: 0,
        replies: 0,
        retweets: 0,
        type: 'original',
        parentId: id
      })
    ]).catch(err => console.log(err))
  },
  retweet: ({tweetId, userId, id, createdAt, content}) => {
    return Promise.all([
      psql.incrementTweetRetweet(id),
      psql.saveOneTweet({
        id: tweetId,
        userId: userId,
        message: '',
        date: createdAt,
        impressions: 0,
        views: 0,
        likes: 0,
        replies: 0,
        retweets: 0,
        type: 'original',
        parentId: id
      })
    ]).catch(err => console.log(err))
  }
}


// const psql = require('./database/psql.js')
//
// module.exports.parseData = (data) => {
//   let message = data.Messages[0];
//   let { tweetId, type, userId, id, createdAt } = message.MessageAttributes;
//   return {
//     tweetId: tweetId.StringValue,
//     type: type.StringValue,
//     userId: userId.StringValue,
//     id: id && id.StringValue,
//     createdAt: createdAt && createdAt.StringValue,
//     content: message.Body
//   }
// }
//
// module.exports.route = {
//   view: ({tweetId}) => psql.incrementTweetView(tweetId),
//   like: ({tweetId}) => psql.incrementTweetLike(tweetId),
//   original: ({tweetId, userId, createdAt, content}) => {
//     return psql.saveOneTweet({
//       id: tweetId,
//       userId: userId,
//       message: content,
//       date: createdAt,
//       impressions: 0,
//       views: 0,
//       likes: 0,
//       replies: 0,
//       retweets: 0,
//       type: 'original'
//     })
//   },
//   reply: ({tweetId, userId, id, createdAt, content}) => {
//     return promise.all([
//       psql.incrementTweetReply(id),
//       psql.saveOneTweet({
//         id: tweetId,
//         userId: userId,
//         message: content,
//         date: createdAt,
//         impressions: 0,
//         views: 0,
//         likes: 0,
//         replies: 0,
//         retweets: 0,
//         type: 'original',
//         parentId: id
//       })
//     ])
//   },
//   retweet: ({tweetId, userId, id, createdAt, content}) => {
//     return promise.all([
//       psql.incrementTweetRetweet(id),
//       psql.saveOneTweet({
//         id: tweetId,
//         userId: userId,
//         message: '',
//         date: createdAt,
//         impressions: 0,
//         views: 0,
//         likes: 0,
//         replies: 0,
//         retweets: 0,
//         type: 'original',
//         parentId: id
//       })
//     ])
//   }
// }
