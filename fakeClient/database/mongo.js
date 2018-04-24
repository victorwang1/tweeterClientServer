const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/fakeClient', { useMongoClient: true });

// var db = mongoose.connection;
//
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function() {
//
// });

let userSchema = mongoose.Schema({
  "name": String,
  "handle": { type: String, unique: true },
  "timeZone": String,
  "publisher": Number,
  "followings": [ String ],
  "followers": [ String ],
  "tweets": [ mongoose.Schema.Types.Mixed ],
  "activeTime": [ Number ],
  "impressionProb": [ Number ],
  "impressionProbInactive": [ Number ],
  "viewProb": [ Number ],
  "likeProb": [ Number ],
  "replyProb": [ Number ],
  "retweetProb": [ Number ]
});

let tweetSchema = mongoose.Schema({
  "tweetId": Number,
  "userId": String,
  "message": String,
  "date": Date,
  "impressions": Number,
  "views": Number,
  "likes": Number,
  "replies": Number,
  "retweets": Number,
  "type": String,
  "parentId": Number
});


let User = mongoose.model('User', userSchema);
let Tweet = mongoose.model('Tweet', tweetSchema);


let saveUser = (data) => new Repo(data).save().catch(err => err);
let saveUsers = (data) => {
  User.insertMany(data)
      .then(document => {
        // console.log(document);
      })
      .catch(err => {

      });
}

let saveTweet = (data) => new Repo(pluckData(data)).save().catch(err => err);
let saveTweets = (data) => {
  Tweet.insertMany(data)
  .then(document => {
    // console.log(document);
  })
  .catch(err => {

  });
}

let findUser = (q = {}) => {
  return User.find(q)
             .limit()
             .sort({ updated: -1 });
};

let findTweet = (q = {}) => {
  return Tweet.find(q)
              .limit(25)
              .sort({ updated: -1 });
};


module.exports = {
  saveUser,
  saveUsers,
  saveTweet,
  saveTweets,
  findUser,
  findTweet
}
