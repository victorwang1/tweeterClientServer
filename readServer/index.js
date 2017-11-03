const express = require('express')
const app = express()

app.get('/tweet/:tweetId', (req, res) => {
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
    res.sendStatus(200);
  });

  const get = tweetId => axios.get(url + '/' + tweetId)
                              .catch(err => console.log(err));
})


app.listen(3001, () => {
  console.log('listening on port 3000!')
})
