
// index is an array of length n,
// of integers such that the integer
// at position i is between 0 and (n-i-1)
// for example, for length n=8, maximum
// value in each position is:
// position: 0 1 2 3 4 5 6 7
// -------------------------
// min val:  0 0 0 0 0 0 0 0
// max val:  7 6 5 4 3 2 1 0
// this function will get the next 8-digit
// number for which this holds, so:
// (* indicates digit is carried)
// current:  0 0 0 0 0  0  0  0
// next:     0 0 0 0 0  0  1  0
// then:     0 0 0 0 0  1* 0  0 
// then:     0 0 0 0 0  1  1  0 
// next:     0 0 0 0 0  2* 0  0
// next:     0 0 0 0 0  2  1  0
// then:     0 0 0 0 1* 0* 0  0 
// etc.
function nextPermIndex(index) {
  for(var i = index.length - 2; i >= 0; i--) {
    var thisDigitMax = index.length - i - 1;
    index[i]++;
    if (index[i] > thisDigitMax) {
      // carry:
      index[i] = 0;
    } else {
      return index;
    }
  }
}

function toBinary(digit, places) {
  var tmp = digit.toString(2);
  var padding = '';
  for (var i=tmp.length; i < places; i++) {
     padding += '0';
  }
  return padding + tmp;
}

function lengthToNumVars(len) {
  return {
    2: 1,
    4: 2,
    8: 3,
    16: 4,
    32: 5,
    64: 6,
    128: 7,
    256: 8
  }[len];
}

function indexToPerm(index) {
  var places = lengthToNumVars(index.length);
  var perm = new Array(index.length);
  for (var i = 0; i < index.length; i++) {
    perm[i] = undefined;
  }
  for (var i = 0; i < index.length; i++) {
    placeDigit(i, index[i]);
  }
  function placeDigit(digit, moves) {
    var pos = 0, moved=0;
    do {
      if (perm[pos] === undefined) { // position is still free
        if (moved === moves) {
          perm[pos] = toBinary(digit, places);
          break;
        }
        moved++;
      }
      pos++;
    } while (true);
  }
  return perm;
}

function getOutput(which, perm) {
  var output = [];
  for (var i = 0; i < perm.length; i++) {
    output.push(perm[i][which]);
  }
  return output;
}

function reduceFor(output, input) {
  var step = Math.pow(2, lengthToNumVars(output.length) - input - 1);
  var sign = true;
  var reduced = {
    false: '',
    true: ''
  };
  for (var i = 0; i < output.length; i++) {
    if (i % step === 0) {
      sign = !sign;
    }
    reduced[sign] += output[i];
  }
  return reduced;
}

function dependsOn(perm, outputNum, inputNum) {
  var reduced = reduceFor(getOutput(outputNum, perm), inputNum);
  return (reduced[false] !== reduced[true]);
}

function dependencyCounts(perm) {
  var numVars = lengthToNumVars(perm.length);
  var deps = new Array(numVars);
  for(var o = 0; o < numVars; o++) {
    deps[o] = 0;
    for(var i = 0; i < numVars; i++) {
      if (dependsOn(perm, o, i)) {
        deps[o]++;
      }
    }
  }
  return deps;
}

function countPerDeps(funcs) {
  var perDeps = {};
  for (perm of Object.keys(funcs)) {
    var thisDepCount = funcs[perm].depCount;
    if (perDeps[thisDepCount]) {
      perDeps[thisDepCount]++;
    } else {
      perDeps[thisDepCount] = 1;
    }
  }
  return perDeps;
}

function fromBinary(str) {
  return parseInt(str, 2);
}

function findDual(perm) {
  var dual = new Array(perm.length);
  var places = lengthToNumVars(perm.length);
  for(var i=0; i<perm.length; i++) {
    dual[fromBinary(perm[i])] = toBinary(i, places);
  }
  return dual;
}

function analyze(numVars) {
  var progress = 0;
  var funcs = {};
  var permLen = Math.pow(2, numVars);
  var curr = new Array(permLen);
  for (var i=0; i<permLen; i++) {
    curr[i] = 0;
  }
  do {
    var perm = indexToPerm(curr);
    var dual = findDual(perm);
    var ownDual = (dual.join(',') === perm.join(','));
    funcs[perm] = {
      depCount: dependencyCounts(perm).join('') + '-' + (ownDual ? '*' : dependencyCounts(dual).join('')),
      dual,
      ownDual
    };
    curr = nextPermIndex(curr);
    if (++progress % 10000 === 0) {
      console.log('progress ', progress);
    }
  } while(curr);
  return {
    funcs,
    perDepCount: countPerDeps(funcs)
  };
}

var analysis = {
};

analysis[1] = analyze(1);
console.log(analysis[1].funcs);
console.log(analysis[1].perDepCount);

analysis[2] = analyze(2);
console.log(analysis[2].funcs);
console.log(analysis[2].perDepCount);

analysis[3] = analyze(3);
console.log(analysis[3].perDepCount);

// analysis[4] = analyze(4);
// console.log(analysis[4].perDepCount);
