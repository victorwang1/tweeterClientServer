const neo4j = require('neo4j-driver').v1;
const driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', 'abcde'));
const session = driver.session();

const addUser = (userId) => {
  return session.run(
    `MERGE (a:User {id: $id})
     ON CREATE SET a.id = $id`,
     {id: userId}
  );
};
//
// const addManyUsers = (userIds) => {
//   var format = idArray => idArray.map(id => ({'id': id}));
//   return session.run(
//     `UNWIND $props AS map
//      CREATE (n)
//      SET n = map
//      RETURN n`,
//      { "props" : format(userIds) }
//   ).then(result => console.log(result));
// };

const newFollow = (userId, followerId) => {
  return session.run(
    `MATCH (a:User { id: $id1 }), (b:User { id: $id2 })
     MERGE (a)-[:FOLLOWS]->(b)`,
     {id1: followerId, id2: userId}
  )
};

const getFollowers = (userId) => {
  return session.run(
    `MATCH (user {id: $id})<--(follower)
     RETURN follower`,
     {id: userId}
  ).then(result => {
    var resultArray = result.records.length && result.records;
    return resultArray && resultArray.map(item => item.toObject().follower.properties.id);
  })
}

// var count = 1;
// for (var i = 0; i <= 1; i++) {
//   for (var j = 0; j < 1000; j++) {
//     var fn = () => {
//       addUser(count);
//       count++;
//     }
//     setTimeout(fn, j * 15);
//   }
// }

var write = async () => {
  for (var i = 200001; i <= 700000; i++) {
    await addUser(i);
    console.log(i);
  }
}



module.exports = {
  addUser,
  newFollow,
  getFollowers
}
