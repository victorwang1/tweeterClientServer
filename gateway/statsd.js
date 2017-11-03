const StatsD = require('node-statsd'),
      client = new StatsD({host: 'statsd.hostedgraphite.com',
                           port: 8125,
                           prefix: 'b5877a09-907b-4014-bc3e-4437d07a2931'});
                           
client.socket.on('error', function(error) {
  return console.error("Error in socket: ", error);
});

module.exports = client
