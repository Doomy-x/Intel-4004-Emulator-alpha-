const fs = require('fs');
const vm = require('vm');

// Create minimal DOM stubs
const stubs = {
  alert: (msg) => console.log('ALERT:', msg),
  document: {
    all: undefined,
    createElement: () => ({
      appendChild: () => {},
      getElementsByTagName: () => [],
      style: {},
      onclick: null,
      onchange: null
    }),
    getElementsByName: () => [{}],
    getElementById: () => ({
      innerHTML: '',
      checked: false,
      value: '',
      style: {},
      getElementsByTagName: () => [],
      appendChild: () => {},
      insertBefore: () => {},
      onclick: null,
      onchange: null
    })
  },
  window: {
    screen: { height: 600, width: 800 },
    event: null,
    onload: null
  },
  console: console,
  setTimeout: (fn) => {},
  Array: Array
};

const mainCode = fs.readFileSync('./main.js', 'utf8');

const context = { ...stubs };
vm.runInNewContext(mainCode, context);

console.log('=== Intel 4004 Emulator Terminal Tests ===\n');

// Utility to run instructions
function runInstruction(name) {
  const code = context.activeCode();
  console.log(`  ${name} (0x${code.toString(16).toUpperCase()})`);
  context.codes[code]();
}

// TEST 1: Simple Load
console.log('TEST 1: Load value 5 into Accumulator');
console.log('-------------------------------------');
context.resetCPU();
context.clearRAM();
context.clearROM();

// Manually set program: D5 = LDM 5 (load 5 into accumulator)
context.prom[0] = 0xD5;

console.log('Before: A =', context.A_reg);
runInstruction('LDM 5');
console.log('After:  A =', context.A_reg);
console.log(context.A_reg === 5 ? '✓ PASSED\n' : '✗ FAILED\n');

// TEST 2: Clear Both
console.log('TEST 2: Clear Both flags and accumulator');
console.log('---------------------------------------');
context.resetCPU();
context.A_reg = 7;
context.C_flag = 1;
context.T_flag = 1;

// F0 = CLB (clear both)
context.prom[0] = 0xF0;

console.log('Before: A =', context.A_reg, 'C =', context.C_flag, 'T =', context.T_flag);
runInstruction('CLB');
console.log('After:  A =', context.A_reg, 'C =', context.C_flag, 'T =', context.T_flag);
console.log(context.A_reg === 0 && context.C_flag === 0 && context.T_flag === 1 ? '✓ PASSED (T should remain)\n' : '✗ FAILED\n');

// TEST 3: Increment Accumulator
console.log('TEST 3: Increment Accumulator (IAC)');
console.log('-----------------------------------');
context.resetCPU();
context.A_reg = 3;

// F2 = IAC (increment accumulator)
context.prom[0] = 0xF2;

console.log('Before: A =', context.A_reg);
runInstruction('IAC');
console.log('After:  A =', context.A_reg);
console.log(context.A_reg === 4 ? '✓ PASSED\n' : '✗ FAILED\n');

// TEST 4: Increment Register
console.log('TEST 4: Increment Register R0');
console.log('------------------------------');
context.resetCPU();
context.R_regs[0] = 2;

// 60 = INC R0
context.prom[0] = 0x60;

console.log('Before: R0 =', context.R_regs[0]);
runInstruction('INC R0');
console.log('After:  R0 =', context.R_regs[0]);
console.log(context.R_regs[0] === 3 ? '✓ PASSED\n' : '✗ FAILED\n');

// TEST 5: Load and Add
console.log('TEST 5: Load value and Add');
console.log('---------------------------');
context.resetCPU();
context.R_regs[1] = 4;  // Pre-set R1 to 4
context.A_reg = 0;

// D3 = LDM 3
context.prom[0] = 0xD3;
console.log('Step 1: Load 3');
runInstruction('LDM 3');
console.log('  A =', context.A_reg);

// 81 = ADD R1
context.prom[1] = 0x81;
console.log('Step 2: Add R1 (which contains 4)');
runInstruction('ADD R1');
console.log('  A =', context.A_reg, 'C =', context.C_flag);
console.log(context.A_reg === 7 && context.C_flag === 0 ? '✓ PASSED\n' : '✗ FAILED\n');

// TEST 6: Carry Flag on Overflow
console.log('TEST 6: Addition with Carry (Overflow)');
console.log('--------------------------------------');
context.resetCPU();
context.A_reg = 0xF;  // 15 in hex
context.R_regs[0] = 0x2;  // 2 in hex
context.C_flag = 0;

// 80 = ADD R0
context.prom[0] = 0x80;

console.log('Before: A = 0x' + context.A_reg.toString(16).toUpperCase() + ', C =', context.C_flag);
runInstruction('ADD R0');
console.log('After:  A = 0x' + context.A_reg.toString(16).toUpperCase() + ', C =', context.C_flag);
console.log(context.A_reg === 1 && context.C_flag === 1 ? '✓ PASSED (overflow detected)\n' : '✗ FAILED\n');

console.log('=== All Tests Complete ===');
