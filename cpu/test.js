// Load the main emulator
const fs = require('fs');
const vm = require('vm');

// Read main.js and emu_comm.js
const mainCode = fs.readFileSync('./main.js', 'utf8');
const emuCode = fs.readFileSync('./emu_comm.js', 'utf8');

// Create a context with required DOM functions (stub for emu_comm.js)
const changeAll = () => {}; // Stub for GUI update
const getHexAddr = (addr) => addr.toString(16).padStart(3, '0').toUpperCase();

const context = {
  alert: (msg) => console.log('ALERT:', msg),
  changeAll: changeAll,
  getHexAddr: getHexAddr,
  document: {
    createElement: () => ({}),
    getElementsByName: () => [{}],
    getElementById: () => ({
      innerHTML: '',
      checked: false,
      value: '',
      getElementsByTagName: () => [],
      appendChild: () => {},
      insertBefore: () => {},
      style: {},
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
  setTimeout: (fn, delay) => {}
};

// Execute code in context
vm.runInNewContext(mainCode, context);

console.log('=== Intel 4004 Emulator - Terminal Test ===\n');

// Test 1: Simple Load and Increment
console.log('TEST 1: Load 3, then increment 4 times');
console.log('----------------------------------------');
context.reset();
context.resetCPU();
context.load('D3 F2 F2 F2 F2', 0);
console.log('Initial state:');
console.log('  A_reg:', context.A_reg);
console.log('  PC:', context.PC_stack[0]);

// Execute first instruction (D3 = load 3)
console.log('\nAfter loading 3:');
console.log('  A_reg:', context.A_reg);

// Manual step through
for (let i = 0; i < 4; i++) {
  context.codes[context.activeCode()]();
  console.log(`  After step ${i+1}: A_reg = ${context.A_reg}, PC = ${context.PC_stack[0]}`);
}
console.log('\n✓ Test 1 Complete\n');

// Test 2: Load and Add
console.log('TEST 2: Load 5, Add with register containing 3');
console.log('----------------------------------------------');
context.reset();
context.resetCPU();
context.load('D3 B0 D5 80', 0);

console.log('Expected: Load 3 → Exchange with R0 → Load 5 → Add R0');
console.log('Final A should be 8\n');

for (let i = 0; i < 4; i++) {
  const instr = context.activeCode();
  const instrName = context.opctab[instr];
  console.log(`Step ${i+1}: Executing ${instrName} (0x${instr.toString(16).toUpperCase()})`);
  context.codes[instr]();
  console.log(`  A_reg = ${context.A_reg}, R0 = ${context.R_regs[0]}, PC = ${context.PC_stack[0]}`);
}

console.log(`\nFinal Accumulator: ${context.A_reg}`);
console.log(context.A_reg === 8 ? '✓ Test 2 PASSED' : '✗ Test 2 FAILED');
console.log();

// Test 3: Clear Both
console.log('TEST 3: Clear Both (CLB) - Set A to 7, then clear');
console.log('--------------------------------------------------');
context.reset();
context.resetCPU();
context.load('D7 F0', 0);

context.codes[context.activeCode()]();  // Load 7
console.log(`After loading 7: A = ${context.A_reg}, C = ${context.C_flag}`);

context.codes[context.activeCode()]();  // Clear Both
console.log(`After CLB: A = ${context.A_reg}, C = ${context.C_flag}`);
console.log(context.A_reg === 0 && context.C_flag === 0 ? '✓ Test 3 PASSED' : '✗ Test 3 FAILED');
console.log();

// Test 4: Increment Register
console.log('TEST 4: Increment Register (INC R0)');
console.log('-----------------------------------');
context.reset();
context.resetCPU();
context.R_regs[0] = 0;
context.load('60', 0);  // INC R0

console.log(`Initial R0: ${context.R_regs[0]}`);
context.codes[context.activeCode()]();
console.log(`After INC R0: ${context.R_regs[0]}`);
console.log(context.R_regs[0] === 1 ? '✓ Test 4 PASSED' : '✗ Test 4 FAILED');
console.log();

console.log('=== All Tests Complete ===');
