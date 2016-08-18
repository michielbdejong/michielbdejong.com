// ATTENTION: This script enumerates minimal NAND *expressions*,
// not minimal NAND circuits. For instance, it counts
// ((A NAND B) NAND (A NAND B)) as an expression containing 3
// NAND operators, basically this circuit:
//
//        xxxxxxx        
// A ---*-x      x       
//      | x NAND  xO----
// B -*-|-x      x      \     xxxxxxx
//    | | xxxxxxx        -----x      x
//    | |                     x NAND  xO--- OUT
//    | \ xxxxxxx        -----x      x
//    |  -x      x      /      xxxxxxx
//    \   x NAND  xO----
//     ---x      x      
//        xxxxxxx       
//
// Whereas as a circuit, you would implement this as follows:
//
//       xxxxxxx             xxxxxxx
// A ----x      x      /-----x      x
//       x NAND  xO----|     x NAND  xO--- OUT
// B ----x      x      \-----x      x
//       xxxxxxx             xxxxxxx
//
// Which uses only two gates instead of three,
// because the first gate (A NAND B) is used
// for both the inputs to the second gate.
//
// (Both circuits implement AND, by the way. :)

var numVars = 3; // A,B,C,T,F
var valuationLength = Math.pow(2, numVars);
var numValuations = Math.pow(2, valuationLength);
var minimal = {
  '00001111': 'A',
  '00110011': 'B',
  '01010101': 'C',
  '00000000': 'F',
  '11111111': 'T',
};

function nand(left, right) {
  if (left === '1' && right === '1') {
    return '0';
  }
  return '1';
}

function sweep() {
  // without reuse of intermediate results:
  for(var left = 0; left < have.length; left++) {
    console.log('left', left, have[left]);
    for(var right = left; right < have.length; right++) {
      console.log('right', right, have[right]);
      var thisCircuit = '(' + minimal[have[left]] + ',' + minimal[have[right]] + ')';
      var valuation = '';
      for (var i=0; i<valuationLength; i++) {
        valuation += nand(have[left][i], have[right][i]);
      }
      if (typeof minimal[valuation] === 'undefined') {
        console.log(thisCircuit, valuation);
        minimal[valuation] = thisCircuit;
      } else {
        console.log('~', thisCircuit, valuation);
      }
    }
  }
}

var have = Object.keys(minimal);
var sweepNo = 0;
do {
  sweep();
  have = Object.keys(minimal);
  console.log(`After sweep ${++sweepNo}: ${have.length}`);
} while(have.length < numValuations);
