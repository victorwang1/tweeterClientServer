var Sentencer = require('sentencer')

const randomElement = array => array[Math.floor(Math.random() * array.length)];

Sentencer.configure({
  actions: {
    opening: () => {
      var opening = ['just', 'ask me how i', 'completely', 'nearly', 'productively', 'efficiently', 'last night i', 'the president', 'that wizard', 'a ninja', 'a seedy old man'];
      return randomElement(opening);
    },
    verb: () => {
      var verbs = ['downloaded', 'interfaced', 'deployed', 'developed', 'built', 'invented', 'experienced', 'navigated', 'aided', 'enjoyed', 'engineered', 'installed', 'debugged', 'delegated', 'automated', 'formulated', 'systematized', 'overhauled', 'computed'];
      return randomElement(verbs);
    },
    objects: () => {
      var objects = ['my', 'your', 'the', 'a', 'my', 'an entire', 'this', 'that', 'the', 'the big', 'a new form of', 'a magical'];
      return randomElement(objects);
    },
    tags: () => {
      var tags = ['#techlife', '#burningman', '#sf', 'but only i know how', 'for real', '#sxsw', '#ballin', '#omg', '#yolo', '#magic', '', '', '', ''];
      return randomElement(tags);
    }
  }
});

const newMessage = () => {
  return Sentencer.make("{{ opening }} {{ verb }} {{ objects }} {{ adjective }} {{ noun }} {{ tags }}");
}

module.exports = newMessage
