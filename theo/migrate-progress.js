var fs = require('fs');

var read = JSON.parse(fs.readFileSync('progress-1.json'));
var minimalCircuits = {};
for (var infosetBin in read.minimalCircuits) {
  var infosetHex = '';
  for (var i=0; i<infosetBin.length; i+=4) {
    var bin = infosetBin.substring(i, i+4);
    var hex = parseInt(bin, 2).toString(16);
    infosetHex += hex;
  }
  minimalCircuits[infosetHex] = read.minimalCircuits[infosetBin];
}
read.minimalCircuits = minimalCircuits;

fs.writeFileSync('progress-1.json', JSON.stringify(read, null, 2));
