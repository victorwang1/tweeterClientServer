var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});

const test = () => {
  client.ping({
    // ping usually has a 3000ms timeout
    requestTimeout: 1000
  }, function (error) {
    if (error) {
      console.trace('elasticsearch cluster is down!');
    } else {
      console.log('All is well');
    }
  });
}

const writeTweetsBulk = (data) => {
  var body = [];
  data.forEach(tweet =>
    body.push({ index: { _index: 'tweeter', _type: 'tweet', _id: tweet.id } }, tweet)
  );
  return client.bulk({ body: body });
}

const writeTweet = (tweet) => {
  return client.create({
    index: 'tweeter',
    type: 'tweet',
    id: 1,
    body: tweet
  });
}

module.exports = {
  writeTweetsBulk,
  writeTweet
}
