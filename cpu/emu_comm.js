var hextab = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'];

var opctab = [
	'NOP',   '???',   '???',   '???',   '???',   '???',   '???',   '???',
	'???',   '???',   '???',   '???',   '???',   '???',   '???',   '???',
	'???',   'JCN TZ','JCN CZ','???',   'JCN AZ','???',   '???',   '???',
	'???',   'JCN TN','JCN CN','???',   'JCN AN','???',   '???',   '???',
	'FIM P0','SRC P0','FIM P1','SRC P1','FIM P2','SRC P2','FIM P3','SRC P3',
	'FIM P4','SRC P4','FIM P5','SRC P5','FIM P6','SRC P6','FIM P7','SRC P7',
	'FIN P0','JIN P0','FIN P1','JIN P1','FIN P2','JIN P2','FIN P3','JIN P3',
	'FIN P4','JIN P4','FIN P5','JIN P5','FIN P6','JIN P6','FIN P7','JIN P7',
	'JUN',   'JUN',   'JUN',   'JUN',   'JUN',   'JUN',   'JUN',   'JUN',
	'JUN',   'JUN',   'JUN',   'JUN',   'JUN',   'JUN',   'JUN',   'JUN',
	'JMS',   'JMS',   'JMS',   'JMS',   'JMS',   'JMS',   'JMS',   'JMS',
	'JMS',   'JMS',   'JMS',   'JMS',   'JMS',   'JMS',   'JMS',   'JMS',
	'INC R0','INC R1','INC R2','INC R3','INC R4','INC R5','INC R6','INC R7',
	'INC R8','INC R9','INC R10','INC R11','INC R12','INC R13','INC R14','INC R15',
	'ISZ R0','ISZ R1','ISZ R2','ISZ R3','ISZ R4','ISZ R5','ISZ R6','ISZ R7',
	'ISZ R8','ISZ R9','ISZ R10','ISZ R11','ISZ R12','ISZ R13','ISZ R14','ISZ R15',
	'ADD R0','ADD R1','ADD R2','ADD R3','ADD R4','ADD R5','ADD R6','ADD R7',
	'ADD R8','ADD R9','ADD R10','ADD R11','ADD R12','ADD R13','ADD R14','ADD R15',
	'SUB R0','SUB R1','SUB R2','SUB R3','SUB R4','SUB R5','SUB R6','SUB R7',
	'SUB R8','SUB R9','SUB R10','SUB R11','SUB R12','SUB R13','SUB R14','SUB R15',
	'LD R0', 'LD R1', 'LD R2', 'LD R3', 'LD R4', 'LD R5', 'LD R6', 'LD R7',
	'LD R8', 'LD R9', 'LD R10','LD R11','LD R12','LD R13','LD R14','LD R15',
	'XCH R0','XCH R1','XCH R2','XCH R3','XCH R4','XCH R5','XCH R6','XCH R7',
	'XCH R8','XCH R9','XCH R10','XCH R11','XCH R12','XCH R13','XCH R14','XCH R15',
	'BBL 0', 'BBL 1', 'BBL 2', 'BBL 3', 'BBL 4', 'BBL 5', 'BBL 6', 'BBL 7',
	'BBL 8', 'BBL 9', 'BBL 10','BBL 11','BBL 12','BBL 13','BBL 14','BBL 15',
	'LDM 0', 'LDM 1', 'LDM 2', 'LDM 3', 'LDM 4', 'LDM 5', 'LDM 6', 'LDM 7',
	'LDM 8', 'LDM 9', 'LDM 10','LDM 11','LDM 12','LDM 13','LDM 14','LDM 15',
	'WRM',   'WMP',   'WRR',   'WPM',   'WR0',   'WR1',   'WR2',   'WR3',
	'SBM',   'RDM',   'RDR',   'ADM',   'RD0',   'RD1',   'RD2',   'RD3',
	'CLB',   'CLC',   'IAC',   'CMC',   'CMA',   'RAL',   'RAR',   'TCC',
	'DAC',   'TCS',   'STC',   'DAA',   'KBP',   'DCL',   '???',   '???',
];

var steptab = [
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
  2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
  2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
];

// element references
var pcElements, registersElements, accuElement, carryElement, testElement, cyclesElement;

var endAddr = 0;
var disArray = [];

function getHexByte(data) {
	return '' + hextab[Math.floor(data / 0x10)] + hextab[data & 0x0f];
}

function getHexAddr(data) {
	return '' + hextab[Math.floor((data & 0x0f00) / 0x100)] + hextab[Math.floor((data & 0x0f0) / 0x10)] + hextab[data & 0x00f];
}

function DisAsmStep(pc) {
	var addr, ops1, ops2, disas, instr;
	instr = prom[pc];
	addr = getHexAddr(pc);
	ops1 = getHexByte(instr);
	ops2 = '  ';
	disas = opctab[instr];
	if (steptab[instr] > 1) {
		ops2 = getHexByte(prom[pc + 1]);
		if ((instr > 0x3f) && (instr < 0x60)) disas += ' $' + getHexAddr((((instr << 8) & 0xf00) | prom[pc + 1]));
		else disas += ',$' + getHexByte(prom[pc + 1]);
	}
	return ([addr, ops1, ops2, disas]);
}

function load(data, address) {
	if (endAddr != 0) { alert("Press RESET before loading"); return; }
	var i, j = false;
	address = address || 0;
	address = parseInt(address, 16);
	data = data.toUpperCase();
	for (i = 0; i < data.length; ++i) {
		if (data[i] == "*" && data[i + 1] == "=" && data[i + 2] == "$") {
			address = parseInt(data[i + 3] + data[i + 4] + data[i + 5] + data[i + 6], 16);
			i += 7;
			j = false;
		}
		if ((data[i] >= "0" && data[i] <= "9") || (data[i] >= "A" && data[i] <= "F"))
			if (j === false)
				j = parseInt(data[i], 16);
			else {
				prom[address++ % 0x1000] = (j * 0x10 + parseInt(data[i], 16));
				j = false;
			}
	}
	endAddr = address;
	changeAll();
}

function _pc(isChange, j) {
	var els = pcElements;
	if (!els) return;

	if (isChange) {
		var val = prompt('Enter address [000-FFF]:', '');
		if (!val) return;
		var v = parseInt(val, 16);
		if (isNaN(v) || v < 0 || v > 0xfff) return;
		PC_stack[j] = v;
	}

	// update all 4 stack entries, 3 cells each
	for (var s = 0; s < 4; s++) {
		els[s * 3].innerHTML     = hextab[Math.floor((PC_stack[s] & 0xf00) / 0x100)];
		els[s * 3 + 1].innerHTML = hextab[Math.floor((PC_stack[s] & 0x0f0) / 0x10)];
		els[s * 3 + 2].innerHTML = hextab[PC_stack[s] & 0x00f];
	}
}

function _registers(isChange) {
	var els = registersElements;
	if (!els) return;

	if (isChange) {
		var val = prompt('Enter value [0-F]:', '');
		if (!val) return;
	}

	// fill all 16 registers into available td cells
	for (var i = 0; i < 16 && els[i]; i++) {
		els[i].innerHTML = R_regs[i].toString(16).toUpperCase();
	}
}

function _accu(isChange) {
	if (isChange) {
		var val = prompt('Enter value [0-F]:', '');
		if (!val) return;
		A_reg = parseInt(val, 16) & 0xf;
	}
	if (!accuElement) return;
	var b = accuElement.getElementsByTagName('b')[0];
	if (!b) return;
	b.innerHTML = A_reg.toString(16).toUpperCase() + ' ['
		+ ((A_reg & 0x8) ? '1' : '0')
		+ ((A_reg & 0x4) ? '1' : '0')
		+ ((A_reg & 0x2) ? '1' : '0')
		+ ((A_reg & 0x1) ? '1' : '0') + ']';
}

function _carry(isChange) {
	if (isChange) C_flag = C_flag ? 0 : 1;
	if (carryElement) carryElement.checked = C_flag ? true : false;
}

function _test(isChange) {
	if (isChange) T_flag = T_flag ? 0 : 1;
	if (testElement) testElement.checked = T_flag ? true : false;
}

function _cycles() {
	if (cyclesElement) {
		cyclesElement.innerHTML = '<b>CYCLES:</b> <span>' + cpuCycles + '</span>';
	}
}



function changeAll() {
	_pc(false);
	_registers(false);
	_accu(false);
	_carry(false);
	_test(false);
	_cycles();
	_disAsm();
}

window.onload = function () {
	
	pcElements        = document.getElementById('pc').getElementsByTagName('td');
	registersElements = document.getElementById('registers').getElementsByTagName('td');
	accuElement       = document.getElementById('accu');
	carryElement      = document.getElementById('carry').getElementsByTagName('input')[0];
	testElement       = document.getElementById('test').getElementsByTagName('input')[0];
	cyclesElement     = document.getElementById('cycles');

	// make PC cells clickable
	for (var i = 0; i < pcElements.length; i++) {
		(function(idx) {
			pcElements[idx].onclick = function() { _pc(true, Math.floor(idx / 3)); };
		})(i);
	}

	// make accumulator clickable
	accuElement.onclick = function() { _accu(true); };

	// carry toggle
	document.getElementById('carry').onclick = function() { _carry(true); changeAll(); };

	// test toggle
	document.getElementById('test').onclick = function() { _test(true); changeAll(); };

	// buttons
	document.getElementById('step').onclick = function() { stepFlag = true; };
	document.getElementById('animate').onclick = function() { animFlag = true; };
	document.getElementById('run').onclick = function() { runFlag = true; };
	document.getElementById('stop').onclick = function() { animFlag = runFlag = false; };

	document.getElementById('resetCPU').onclick = function() {
		resetCPU();
		changeAll();
	};

	document.getElementById('ra').onclick = function() {
		reset();
		endAddr = 0;
		document.getElementById('data').value = '';
	};

	document.getElementById('load').onclick = function() {
		load(document.getElementById('data').value, 0);
	};

	document.getElementById('resetROM').onclick = function() {
		clearROM();
		endAddr = 0;
		document.getElementById('data').value = '';
		changeAll();
	};

	// boot
	reset();
	mainLoop();
};