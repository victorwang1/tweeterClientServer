const statsd = require('./statsd.js')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const sqs = require('./sqs.js')
const axios = require('axios')

const tweet = require('./routes/tweet')
const original = require('./routes/original')
const view = require('./routes/view')
const like = require('./routes/like')
const reply = require('./routes/reply')
const retweet = require('./routes/retweet')


app.use((req, res, next) => {
  statsd.increment('.gateway_requests');
  next();
})

app.use(bodyParser.json())

app.use('/tweet', tweet);
app.use('/original', original)
app.use('/view', view)
app.use('/like', like)
app.use('/reply', reply)
app.use('/retweet', retweet)

app.listen(3000, () => {
  console.log('listening on port 3000!')
})
