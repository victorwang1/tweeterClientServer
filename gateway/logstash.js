const axios = require('axios')
const endpoint = 'http://127.0.0.1:31311/logstash'

const init = (monitoring) => {
  monitoring.on('initialized', function (env) {
    env = monitoring.getEnvironment();
    for (var entry in env) {
      let log = entry + ':' + env[entry];
      console.log(log);
      axios.post(endpoint, log)
           .catch(err => console.log(err));
    };
  });

  monitoring.on('cpu', function (cpu) {
    let log = '[' + new Date(cpu.time) + '] CPU: ' + cpu.process;
    console.log(log);
    axios.post(endpoint, log)
         .catch(err => console.log(err));
  });

  monitoring.on('memory', function (memory) {
    let log = '[' + new Date(memory.time) + '] RAM: ' +
                memory.physical_used / 1024 + '/' + memory.physical_total / 1024;
    console.log(log);
    axios.post(endpoint, log)
         .catch(err => console.log(err));
  });

  monitoring.on('http', function (http) {
    let log = '[' + new Date(http.time) + '] HTTP: ' +
                http.method + ' Duration: ' + http.duration;
    console.log(log);
    axios.post(endpoint, log)
         .catch(err => console.log(err));
  });
}

module.exports = {
  init
}
