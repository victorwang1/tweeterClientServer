const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const sqs = require('./sqs.js')
const axios = require('axios')

const original = require('./routes/original')
const view = require('./routes/view')
const like = require('./routes/like')
const reply = require('./routes/reply')
const retweet = require('./routes/retweet')

app.use(bodyParser.json())

app.get('/:tweetId', (req, res) => {
  let tweetId = req.params.tweetId;
  let message = req.body;
  let attributes = {
    "tweetId": {
      DataType: "String",
      StringValue: tweetId
    },
    "type": {
      DataType: "String",
      StringValue: "impression"
    }
  };

  sqs.send(attributes, message).then(() => {
    console.log('message in queue!');
  });

  const get = tweetId => axios.get(url + '/' + tweetId)
                              .catch(err => console.log(err));
  res.send('Hello World!')
})

app.use('/original', original)
app.use('/view', view)
app.use('/like', like)
app.use('/reply', reply)
app.use('/retweet', retweet)

app.listen(3000, () => {
  console.log('listening on port 3000!')
})
