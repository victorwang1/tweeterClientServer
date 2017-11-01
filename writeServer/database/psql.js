const Sequelize = require('sequelize');
const sequelize = new Sequelize('publishers', 'victorwang', '', {
  host: 'localhost',
  dialect: 'postgres',

  pool: {
    max: 5,
    min: 0,
    idle: 10000
  }

});

// Or you can simply use a connection uri
// const sequelize = new Sequelize('postgres://user:pass@example.com:5432/dbname');

const User = sequelize.define('user', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  uuid: { type: Sequelize.STRING },
  name: { type: Sequelize.STRING },
  handle: { type: Sequelize.STRING },
  timeZone: { type: Sequelize.STRING },
  publisher: { type: Sequelize.BOOLEAN },
  activeTime: { type: Sequelize.ARRAY(Sequelize.INTEGER) },
  impressionProb: { type: Sequelize.DECIMAL },
  impressionProbInactive: { type: Sequelize.DECIMAL },
  viewProb: { type: Sequelize.DECIMAL },
  likeProb: { type: Sequelize.DECIMAL },
  replyProb: { type: Sequelize.DECIMAL },
  retweetProb: { type: Sequelize.DECIMAL }
});

const Tweet = sequelize.define('tweet', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: { type: Sequelize.INTEGER },
  message: { type: Sequelize.STRING },
  date: { type: Sequelize.BIGINT },
  impressions: { type: Sequelize.INTEGER },
  views: { type: Sequelize.INTEGER },
  likes: { type: Sequelize.INTEGER },
  replies: { type: Sequelize.INTEGER },
  retweets: { type: Sequelize.INTEGER },
  type: {
    type: Sequelize.ENUM,
    values: ["original", "reply", "retweet"]
  },
  parentId: { type: Sequelize.INTEGER }
});

User.hasMany(Tweet, { as: 'tweets' });
Tweet.belongsTo(User);

sequelize.sync();

// # Database Operations
const saveOneUser = (data) => {
  return User.create(data).then(user => {
    console.log('new user saved!');
  })
}

const saveOneTweet = (data) => {
  return Tweet.create(data).then(tweet => {
    console.log('new tweet saved!');
  })
}

const saveManyUsers = (dataArray) => {
  return User.bulkCreate(dataArray).then(() => {
    console.log('bulk save users successful!');
  });
}

const saveManyTweets = (dataArray) => {
  return Tweet.bulkCreate(dataArray).then(() => {
    console.log('bulk save tweets successful!');
  });
}

const findOneUser = q => User.findOne({ where: q });
const findOneTweet = q => Tweet.findOne({ where: q });

const findUserById = id => User.findById(id);
const findTweetById = id => Tweet.findById(id);

const incrementTweetImpression = (id) => Tweet.increment('impressions', { where: { id: id } });
const incrementTweetView = (id) => Tweet.increment('views', { where: { id: id } });
const incrementTweetLike = (id) => Tweet.increment('likes', { where: { id: id } });
const incrementTweetReply = (id) => Tweet.increment('replies', { where: { id: id } });
const incrementTweetRetweet = (id) => Tweet.increment('retweets', { where: { id: id } });

const updateTweet = (id, data) => {
  Tweet.findOne({ where: { 'id': id } })
      .then(tweet => tweet.update(data));
};

module.exports = {
  saveOneUser,
  saveOneTweet,
  saveManyUsers,
  saveManyTweets,
  findOneUser,
  findOneTweet,
  findUserById,
  findTweetById,
  incrementTweetImpression,
  incrementTweetView,
  incrementTweetLike,
  incrementTweetReply,
  incrementTweetRetweet,
  updateTweet
}
