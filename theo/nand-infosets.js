// An infoset is a subset of all n-to-1 functions which a given circuit can calculate.
// For instance, there are 16 functions from 2-to-1 Boolean variables:
//
// 0000 FALSE
// 0001 (A AND B)
// 0010 (A AND NOT(B))
// 0011 A
// 0100 (NOT(A) AND B)
// 0101 B
// 0110 (A XOR B)
// 0111 (A OR B)
// 1000 (A NOR B)
// 1001 (A NXOR B)
// 1010 NOT(B)
// 1011 (A OR NOT(B)
// 1100 NOT(A)
// 1101 (NOT(A) OR B)
// 1110 (A NAND B)
// 1111 TRUE
//
// The numbering of these functions is by their truth-table, for instance:
//
// A  B || (A AND NOT(B))
// =====||===============
// 0  0 ||  0
// 0  1 ||  0
// 1  0 ||  1
// 1  1 ||  0
//
// The truth table for (A AND NOT(B)) has 0,0,1,0 in its right-hand column, so that function's
// number is 0x0010 binary.
//
// Each circuit of NAND-gates calculates one function on each wire between a NAND-gate and
// the next, and the infoset of a NAND-gate circuit with n variables is defined as the
// 2^(2^n)-bit binary number where the i-th bit is 1 if the i-th function is calculated on
// at least one of the circuit's wires, and 0 otherwise.
// The i-th function is defined as the truth-table based numbering described above.
//
// A non-repeating circuit is one where no two wires in the circuit calculate the same function.
// A non-repeating circuit is represented as a concatenation of NAND-gate-descriptions. Each NAND-gate description
// is an array of two wire-numbers, and also adds a wire to the circuit itself.
// Initially, wires 0 and 1 are available as constants TRUE and FALSE, plus one wire per variable, in order (so wires
// 2,3,... are input variables). After that come the internal wires of the circuit, in order.
// So for instance [2,3,4,4] is the circuit where the first NAND-gate calculates WIRE[4] = (WIRE[2] NAND WIRE[3]),
// and the second gate calculates WIRE[5] = (WIRE[4] NAND WIRE[5]).
// The infoset calculated by the 2-to-1 circuit [2,3,4,4] is:
//   0123 4567 89AB CDEF
// 0x1001 0100 0000 0001   0000 FALSE, 0011 A, 0101 B, 1111 TRUE as calculated trivially by []
// 0x____ ____ ____ __1_   1110 (A NAND B) as calculated additionally by [2,3]
// 0x_1__ ____ ____ ____ + 0001 (A AND B) as calculated additionally by the second gate in [2,3,4,4]
// 0x1101 0100 0000 0011

var numVars = 2;
var numValuations = Math.pow(2, numVars);
var numFunctions = Math.pow(2, numValuations);
var numInfosets = Math.pow(2, numFunctions);

var minimalCircuits = {
  // value for circuit [] to be filled in by initialize function
};

function initialize() {
  var identityFuncs = {
    1: [1],
    2: [1+2, 1+4],
    3: [1+2+4+8, 1+2+16+32, 1+4+16+64],
    4: [1+2+4+8+16+32+64+128, 1+2+16+32+256+512+4096+8192, 1+4+16+64+256+1024+4096+16384],
  };
  var funcs = [];
  for (var i=0; i<numFunctions; i++) {
    funcs.push('0');
  }
  funcs[0] = 1; // FALSE
  funcs[numFunctions - 1] = 1; // TRUE
  for(var i=0; i<identityFuncs[numVars]; i++) {
    funcs[i] = 1;
  }
  minimalCircuits[funcs.join('')] = [];
}


function addGate(toCircuit, leftWire, rightWire) {
  return toCircuit.concat([leftWire, rightWire]);
}

var stack = {
};
// The empty circuit, [], already makes available 2+numVars wires, namely:
stack[[]] = ['0000', '1111', '0011', '0101'];
// Note that [] is used as an object key there, which may be a bit cryptic,
// but using arrays as object keys works well for storing stacks here.

function bitNAND(left, right) {
  if (left === '1' && right === '1') {
    return '0';
  }
  return '1';
}

function NAND(leftValuation, rightValuation) {
  var res = '';
  for (var i=0; i<leftValuation.length; i++) {
    res += bitNAND(leftValuation[i], rightValuation[i]);
  }
  return res;
}

function getStack(circuit) {
  if (typeof stack[circuit] === 'undefined') {
    var addedGate = circuit.slice(circuit.length - 2);
    var baseCircuit = circuit.slice(0, circuit.length -2);
    console.log(`Split ${JSON.stringify(circuit)} into ${JSON.stringify(baseCircuit)} and ${JSON.stringify(addedGate)}`);
    var baseStack = getStack(baseCircuit);
    var addedLeftInput = baseStack[addedGate[0]];
    var addedRightInput = baseStack[addedGate[1]];
    var addedValuation = NAND(addedLeftInput, addedRightInput);
    stack[circuit] = baseStack.concat(addedValuation);
    console.log(`Calculated stack for ${JSON.stringify(circuit)}:`, stack[circuit]);
  }
  return stack[circuit];
}

function circuitOutput(circuit) {
  var circuitVars = getStack(circuit);
  return circuitVars[circuitVars.length -1];
}

function flagPos(wire) {
  console.log('flagPos', wire, parseInt(wire, 2));
  return parseInt(wire, 2);
}

function addWire(infoset, wire) {
  var pos = flagPos(wire);
  res = infoset.substring(0, pos) + '1' + infoset.substring(pos+1);
  console.log(`ORring ${infoset} with ${wire} gives ${res}, now res[${flagPos(wire)}] === ${res[flagPos(wire)]}`);
  return res;
}

var perFlag = {
  '0000': [],
  '0011': [],
  '0101': [],
  '1111': [],
};

function sweep() {
  for (var infoset in minimalCircuits) {
    console.log(`Infoset is ${infoset}`);
    var baseCircuit = minimalCircuits[infoset];
    var numWires = 2 + numVars + baseCircuit.length/2;
    for (var leftWire = 0; leftWire < numWires; leftWire++) {
      for (var rightWire = leftWire; rightWire < numWires; rightWire++) {
        var proposedCircuit = addGate(baseCircuit, leftWire, rightWire);
        var addedWire = circuitOutput(proposedCircuit);
        var useful = (infoset[flagPos(addedWire)] === '0');
        if (useful) {
          var newInfoset = addWire(infoset, addedWire);
          console.log('Comparing', newInfoset, infoset);
          minimalCircuits[newInfoset] = proposedCircuit;
          if (!perFlag[addedWire]) {
            perFlag[addedWire] = proposedCircuit;
          }
          console.log(`Proposing ${proposedCircuit}, which would add ${addedWire} to make ${newInfoset}.`);
        }
      }
    }
  }
}

//...
initialize();
do {
  sweep();
} while(Object.keys(perFlag).length < numFunctions);

console.log(minimalCircuits);
console.log(perFlag);
