var fs = require('fs');

function migrateFile(fileName) {
  var read = JSON.parse(fs.readFileSync(fileName));
  var baseCircuits = [];
  read.minimalCircuitsThisSize = {};

  for (var infosetHex in read.minimalCircuits) {
    var thisCircuitSize = read.minimalCircuits[infosetHex].length / 2;
    if (thisCircuitSize === read.baseCircuitSize) {
      baseCircuits.push({
        infosetHex,
        circuit: read.minimalCircuits[infosetHex]
      });
    } else if (thisCircuitSize === read.baseCircuitSize + 1) {
      read.minimalCircuitsThisSize[infosetHex] = read.minimalCircuits[infosetHex];
    } else {
      // console.log('Forgetting circuit of size', thisCircuitSize, read.baseCircuitSize);
    }
  }
  
  delete read.minimalCircuits;
  
  read.baseCircuits = baseCircuits.sort((a, b) => {
    return (parseInt(a.infosetHex, 16) > parseInt(b.infosetHex, 16));
  });
  
  read.lastBaseCircuitTried = -1;

  fs.writeFileSync(fileName, JSON.stringify(read, null, 2));
}

migrateFile('progress-1.json');
migrateFile('progress-2.json');
migrateFile('progress-3.json');
