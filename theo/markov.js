var rands = {};
function rand(min, bound) {
  // e.g. min=0, bound=10, then range is:
  // 0 1 2 3 4 5 6 7 8 9
  var ret1 = Math.random()*(bound-min);
  var ret = Math.floor(ret1)+min;
  return ret;
}

function nextState(state, switches) {
  if (switches === 'both') {
    var ret = [rand(0, state[1]+1), rand(state[0], 10)];
    return ret;
  }
  if (switches === 'first') {
    return [rand(0, state[1]+1), rand(0, 10)];
  }
  return [rand(0,10), rand(0,10)];
}


var occurrence = {};
['rand', 'first', 'both'].forEach(function(switches) {
  state = [5, 5];
  occurrence[switches] = [{}, {}];
  console.log(`Switches ${switches}:`);
  for (var i=0; i<10000000; i++) {
    state = nextState(state, switches);
    for (var j=0; j<2; j++) {
      if (!occurrence[switches][j][state[j]]) {
        occurrence[switches][j][state[j]] = 0;
      }
      occurrence[switches][j][state[j]]++;
    }
  }
  console.log(occurrence[switches]);
  for (var i=0; i<2; i++) {
    for (var j=0; j<10; j++) {
      var str = `${j}:`;
      if (occurrence[switches][i][j]) {
        for (var k=0; k<occurrence[switches][i][j]/20000; k++) {
          str += '*';
        }
      }
      console.log(str);
    }
  }
});
