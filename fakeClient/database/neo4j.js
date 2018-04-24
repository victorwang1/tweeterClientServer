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

const addManyUsers = (userIds) => {
  return session.run(
    `UNWIND $userIds AS id
     CREATE (a:User {id: id})
     RETURN a`,
     { userIds : userIds }
  ).then(result => console.log(result));
};

const newFollow = (userId, followerId) => {
  return session.run(
    `MATCH (a:User { id: $id1 }), (b:User { id: $id2 })
     MERGE (a)-[:FOLLOWS]->(b)`,
     {id1: followerId, id2: userId}
  )
};

const batchFollow = (userId, followerIdList) => {
  console.log(followerIdList);
  return session.run(
    `UNWIND $followerList AS id2
     MATCH (a:User { id: $id1 }), (b:User { id: id2 })
     MERGE (a)-[:FOLLOWS]->(b)
     RETURN a`,
     { followerList: followerIdList, id1: userId }
  ).then(result => console.log(result))
  .catch(err => console.log(err));
};

const getFollowers = (userId) => {
  return session.run(
    `MATCH (User {id: $id})<--(follower)
     RETURN follower`,
     {id: userId}
  ).then(result => {
    var resultArray = result.records.length && result.records;
    return resultArray && resultArray.map(item => item.toObject().follower.properties.id);
  })
}

var write = async () => {
  var count = 1;
  var userIds = [];
  while (count <= 700001) {
    if (count % 1000 === 0) {
      await addManyUsers(userIds);
      userIds = [];
    }
    userIds.push(count);
    console.log(count);
    count++;
  }
}

// session.run(`CREATE INDEX ON :User(id);`)
//        .then(result => console.log(result));


// write();

module.exports = {
  addUser,
  newFollow,
  batchFollow,
  getFollowers
}
