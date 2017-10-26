var faker = require('faker')

const activeTimes = [[8, 23], [8, 12], [14, 18], [17, 20], [20, 24], [0, 6]];
const randomProb = (min = 0, max = 1) => Math.random() * (max - min) + min;
const randomElement = array => array[Math.floor(Math.random() * array.length)];
const newName = () => [faker.Name.firstName(), faker.Name.lastName()];

var existingUsers = {};

const newUser = () => {
  var name = newName();
  var handle = name.map(item => item.toLowerCase()).join('');

  var retries = 0;
  while (existingUsers[handle]) {
    if (retries > 50) {
      name += '1';
      break;
    }
    name = newName();
    handle = name.map(item => item.toLowerCase()).join('');
    retries++;
  }

  retries = 0;
  existingUsers[handle] = true;

  return {
    "name": name.join(' '),
    "handle": handle,
    "timeZone": "UTC-8:00",
    "publisher": randomProb() > 0.95 ? true : false,
    "followings": [],
    "followers": [],
    "tweets": [],
    "activeTime": randomElement(activeTimes),
    "impressionProb": randomProb(0.2, 1),
    "impressionProbInactive": randomProb(0.001, 0.05),
    "viewProb": randomProb(0.5, 0.95),
    "likeProb": randomProb(0.05, 1),
    "replyProb": randomProb(),
    "retweetProb": randomProb(0.01, 1)
  };
}

module.exports = newUser
