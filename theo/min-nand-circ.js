// ATTENTION: this script has a problem of premature optimization
// so it doesn't find circuits for (A XOR B) and (A NXOR B), as
// these cannot be composed by adding just one gate to an already
// optimal smaller circuit.
//
// This script enumerates minimal NAND *circuits*,
// not minimal NAND expressions. For instance, it counts
// ((A NAND B) NAND (A NAND B)) as a circuit containing 2
// NAND operators:
//
//       xxxxxxx             xxxxxxx
// A ----x      x      /-----x      x
//       x NAND  xO----|     x NAND  xO--- OUT
// B ----x      x      \-----x      x
//       xxxxxxx             xxxxxxx
//
// Whereas as an expression, you would have to count this as an expression
// with three operators:
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
// This is because in this example, the first gate (A NAND B) is used
// for both the inputs to the second gate.
//
// (Both circuits implement AND, by the way. :)

var numVars = 2; // F,T,A,B
var valuationLength = Math.pow(2, numVars);
var numValuations = Math.pow(2, valuationLength);

// Circuits are represented as lists of gates, where a gate
// is defined by its two inputs. Initially, inputs 0 and 1
// are the constants "True" and "False", and depending on numVars,
// there is a number of atomic inputs numbered after that. For instance,
// in two vars A and B, inputs 2 and 3 have valuation A and B respectively.
// Each gate added adds an input for further gates to use, so to recap:
//

var initiallyAvailableVariables = {
  '0': '0000', // false
  '1': '1111', // true
  '2': '0011', // A
  '3': '0101', // B
};

//
// A one-gate circuit is an array of two integers, one for each input of
// the NAND gate:
//
// [2, 2] = (A NAND A) = NOT(A)
// [3, 3] = (B NAND B) = NOT(B)
// [2, 3] = (A NAND B)

var circuitsOfSize = {
  0: {
    '0000': '',
    '1111': '',
    '0011': '',
    '0101': '',
  },
  1: {
//    '1100': '12',
//    '1010': '13',
//    '1110': '23',
  },
  2: {
  },
  3: {
  },
  4: {
  },
  5: {
  },
};

// So a gate is represented as a string of length 2, one for the index of each
// variable.
//
// For bigger circuits, gates are concatenated, and the last gate in the list
// produces the output. Gates that come later in the array can use the outputs
// of previous gates, for instance:
//
// [2, 3, 4, 4] is a concatenation of [2, 3] and [4, 4], representing a
// program, in pseudocode:
//
//     // Initially, indexes 0 (false), 1 (true), 2 (A), and 3 (B) are
//     // available.
//     var x = (A NAND B);
//     // After this first gate [2, 3], x is now available by index 4
//     return (x NAND x);
//     // That's the second gate, represented as [4, 4].
//
// So each two positions in the array representing a circuit represent
// one NAND gate.

// Leaving out zero-gate circuits here, because they can't be reused in
// a meaningful way:
var stack = {
  '': ['0000', '1111', '0011', '0101'],
};

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
    var addedGate = circuit.substring(circuit.length - 2);
    var baseCircuit = circuit.substring(0, circuit.length -2);
    console.log(`Split ${circuit} into ${baseCircuit} and ${addedGate}`);
    var baseStack = getStack(baseCircuit);
    //FIXME: this will go haywire if you have more than 10 variables in a
    //       circuit, but since all two-var functions can be done with
    //       5 gates, we're still safe there. Should switch to double
    //       digits, though, or to arrays of integers.
    var addedLeftInput = baseStack[parseInt(addedGate[0])];
    var addedRightInput = baseStack[parseInt(addedGate[1])];
    var addedValuation = NAND(addedLeftInput, addedRightInput);
    stack[circuit] = baseStack.concat(addedValuation);
    console.log(`Calculated stack for ${circuit}:`, stack[circuit]);
  }
  return stack[circuit];
}

function calculateValuation(circuit) {
  var circuitVars = getStack(circuit);
  return circuitVars[circuitVars.length -1];
}

function proposeCircuit(circuit) {
  var valuation = calculateValuation(circuit);
  var numGatesInCircuit = circuit.length / 2;
  for (var numGates = 0; numGates <= numGatesInCircuit; numGates++) {
    console.log(`Checking for ${numGates}-gate circuits for ${valuation}.`);
    //FIXME: Should also keep circuits that are minimal for producing a set of
    // intermediate results, so sorted list of variable valuations on the stack.
    // It would be good to simultaneously remove the limit of 10 variables from
    // the representation of how ports choose their inputs. Maybe just label the
    // inputs by their valuations? So (A NAND B) would be represented as
    // '1110': '00110101', or maybe better as 15: [3, 5]
    if (typeof circuitsOfSize[numGates][valuation] !== 'undefined') {
      console.log(`Circuit ${circuit} is not smaller than ${circuitsOfSize[numGates][valuation]}.`);
      return;
    }
  }
  console.log(`Found ${circuit} as a minimal circuit for ${valuation}, adding.`);
  circuitsOfSize[numGatesInCircuit][valuation] = circuit;
}

function addGate(onTopOf) {
  // On top of zero gates you have numVar + 2 possible inputs available,
  // where the 2 extra are the true and false constants,
  // and for each next gate, one more input is available, namely the
  // gate that was just added before, so:
  var numIn = numVars + 2 + onTopOf;
  // Use the minimal circuits with one gate less as a base, and add one
  // NAND gate:
  for (var baseCircuitValuation in circuitsOfSize[onTopOf]) {
    var baseCircuit = circuitsOfSize[onTopOf][baseCircuitValuation];
    console.log(`Base circuit ${baseCircuit} of size ${onTopOf} calculates ${baseCircuitValuation}, numIn ${numIn}.`);
    for (var left = 0; left < numIn; left++) {
      for (var right = left; right < numIn; right++) {
        console.log(`proposeCircuit(${baseCircuit} + ${left} + ${right});`);
        proposeCircuit(baseCircuit + left + right);
      }
    }
  }
}

function numValsWeHave() {
  var ret = 0;
  for(var gatesNum in circuitsOfSize) {
    ret += Object.keys(circuitsOfSize[gatesNum]).length;
  }
  console.log(`We have ${ret} out of ${numValuations} valuations now.`);
  return ret;
}

var numGates = 0;
do {
 addGate(numGates);
 numGates++;
 if (numGates >5) {
   console.log('Oops, looks like we need more gates than can be represented currently');
console.log(NAND('1011', '1101'));
   break;
 }
} while (numValsWeHave() < numValuations);

console.log(stack);
console.log(circuitsOfSize);
