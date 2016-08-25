var fs = require('fs');
var progressStatus = {
  '-odd': {
    baseCircuitSize: 0,
    lastBaseCircuitTried: -1,
  },
  '-even': {
    baseCircuitSize: 0,
    lastBaseCircuitTried: -1,
  },
  '': {
    baseCircuitSize: 0,
    lastBaseCircuitTried: -1,
};

for (var fileSuffix in progressStatus) {
  try {
    var read = JSON.parse(fs.readFileSync(`progress-3${fileSuffix}.json`));
    progressStatus[fileSuffix].baseCircuitSize = read.baseCircuitSize;
    progressStatus[fileSuffix].lastBaseCircuitTried = read.lastBaseCircuitTried;
  } catch (e) {
  }
}


.....
