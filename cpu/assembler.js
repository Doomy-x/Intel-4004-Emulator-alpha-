function assemble(src) {

  // ── helpers ─────────────────────────────────────────────────
  function parseNum(s) {
    s = (s || '').trim();
    if (!s) return null;
    var v = s[0] === '$' ? parseInt(s.slice(1), 16)
          : /^0x/i.test(s) ? parseInt(s.slice(2), 16)
          : parseInt(s, 10);
    return isNaN(v) ? null : v;
  }

  function parseReg(s) {
    var m = (s || '').trim().toUpperCase().match(/^R(\d+)$/);
    if (!m) return -1;
    var n = parseInt(m[1]);
    return (n >= 0 && n <= 15) ? n : -1;
  }

  function parsePair(s) {
    s = (s || '').trim().toUpperCase();
    var m = s.match(/^P(\d+)$/);
    if (m) { var n = parseInt(m[1]); return (n >= 0 && n <= 7) ? n : -1; }
    var r = parseReg(s);  // R0→P0, R2→P1 …
    return (r >= 0 && r % 2 === 0) ? (r >> 1) : -1;
  }

  // 2-byte instructions
  var IS2 = { JCN:1, FIM:1, ISZ:1, JUN:1, JMS:1 };

  function instrSize(mn) {
    var ALL = 'NOP JCN FIM SRC FIN JIN JUN JMS INC ISZ ADD SUB LD XCH BBL LDM ' +
              'CLB CLC IAC CMC CMA RAL RAR TCC DAC TCS STC DAA KBP DCL ' +
              'WRM WMP WRR WR0 WR1 WR2 WR3 SBM RDM RDR ADM RD0 RD1 RD2 RD3';
    if (ALL.indexOf(mn) < 0) return -1;
    return IS2[mn] ? 2 : 1;
  }

  // JCN condition bits: bit0=test, bit1=carry, bit2=acc-zero, bit3=invert
  // So: TN=1(test≠0), CN=2(carry=1), AZ=4(acc=0)
  // Add 8 to invert: TNZ=9, CNZ=10, ANZ=12
  var COND = { TN:1, CN:2, AZ:4, TNZ:9, CNZ:10, ANZ:12,
               TZ:9, CZ:10, AN:12 };

  // ── Pass 1: collect labels & build token list ────────────────
  var lines  = src.split('\n');
  var tokens = [];
  var labels = {};
  var pc = 0;
  var errs = [];

  for (var i = 0; i < lines.length; i++) {
    var raw = lines[i].replace(/;.*$/, '').trim();
    if (!raw) continue;

    // strip label (may be alone on line or before mnemonic)
    while (raw.indexOf(':') !== -1) {
      var ci  = raw.indexOf(':');
      var lbl = raw.slice(0, ci).trim().toUpperCase();
      if (lbl) labels[lbl] = pc;
      raw = raw.slice(ci + 1).trim();
    }
    if (!raw) continue;

    var mm = raw.match(/^([A-Za-z]\w*)([\s,].*)?\s*$/);
    if (!mm) { errs.push('Line ' + (i+1) + ': cannot parse: ' + raw); continue; }
    var mn = mm[1].toUpperCase();
    var argsRaw = (mm[2] || '').trim();
    var sz = instrSize(mn);
    if (sz < 0) { errs.push('Line ' + (i+1) + ': unknown mnemonic: ' + mn); continue; }
    tokens.push({ line: i+1, mn: mn, argsRaw: argsRaw, pc: pc });
    pc += sz;
  }

  if (errs.length) return { error: errs.join('  |  ') };

  // ── Pass 2: emit bytes ───────────────────────────────────────
  var bytes = [];

  for (var t = 0; t < tokens.length; t++) {
    var tok  = tokens[t];
    var mn   = tok.mn;
    var ln   = tok.line;
    var args = tok.argsRaw ? tok.argsRaw.split(',').map(function(s){ return s.trim(); }) : [];
    var ag = function(i) { return args[i] || ''; };

    var addr8 = function(s) {
      var u = s.trim().toUpperCase();
      if (u in labels) return labels[u] & 0xFF;
      var v = parseNum(s); return v === null ? null : v & 0xFF;
    };
    var addr12 = function(s) {
      var u = s.trim().toUpperCase();
      if (u in labels) return labels[u] & 0xFFF;
      var v = parseNum(s); return v === null ? null : v & 0xFFF;
    };

    var out = null; // array of bytes, or string error

    switch (mn) {
      case 'NOP': out=[0x00]; break; case 'CLB': out=[0xF0]; break;
      case 'CLC': out=[0xF1]; break; case 'IAC': out=[0xF2]; break;
      case 'CMC': out=[0xF3]; break; case 'CMA': out=[0xF4]; break;
      case 'RAL': out=[0xF5]; break; case 'RAR': out=[0xF6]; break;
      case 'TCC': out=[0xF7]; break; case 'DAC': out=[0xF8]; break;
      case 'TCS': out=[0xF9]; break; case 'STC': out=[0xFA]; break;
      case 'DAA': out=[0xFB]; break; case 'KBP': out=[0xFC]; break;
      case 'DCL': out=[0xFD]; break; case 'WRM': out=[0xE0]; break;
      case 'WMP': out=[0xE1]; break; case 'WRR': out=[0xE2]; break;
      case 'WR0': out=[0xE4]; break; case 'WR1': out=[0xE5]; break;
      case 'WR2': out=[0xE6]; break; case 'WR3': out=[0xE7]; break;
      case 'SBM': out=[0xE8]; break; case 'RDM': out=[0xE9]; break;
      case 'RDR': out=[0xEA]; break; case 'ADM': out=[0xEB]; break;
      case 'RD0': out=[0xEC]; break; case 'RD1': out=[0xED]; break;
      case 'RD2': out=[0xEE]; break; case 'RD3': out=[0xEF]; break;

      case 'INC': case 'ADD': case 'SUB': case 'LD': case 'XCH': {
        var r0 = parseReg(ag(0));
        if (r0 < 0) { out = 'expected register R0-R15, got "' + ag(0) + '"'; break; }
        var base0 = {INC:0x60,ADD:0x80,SUB:0x90,LD:0xA0,XCH:0xB0}[mn];
        out = [base0 | r0]; break;
      }

      case 'BBL': case 'LDM': {
        var v0 = parseNum(ag(0));
        if (v0 === null || v0 < 0 || v0 > 15) { out = 'expected 4-bit value 0-$F, got "' + ag(0) + '"'; break; }
        out = [({BBL:0xC0,LDM:0xD0}[mn]) | v0]; break;
      }

      case 'SRC': { var p0=parsePair(ag(0)); if(p0<0){out='expected pair P0-P7, got "'+ag(0)+'"';break;} out=[0x21|(p0<<1)]; break; }
      case 'FIN': { var p0=parsePair(ag(0)); if(p0<0){out='expected pair P0-P7, got "'+ag(0)+'"';break;} out=[0x30|(p0<<1)]; break; }
      case 'JIN': { var p0=parsePair(ag(0)); if(p0<0){out='expected pair P0-P7, got "'+ag(0)+'"';break;} out=[0x31|(p0<<1)]; break; }

      case 'FIM': {
        var p1 = parsePair(ag(0));
        if (p1 < 0) { out = 'expected pair P0-P7, got "' + ag(0) + '"'; break; }
        var v1 = parseNum(ag(1));
        if (v1 === null || v1 < 0 || v1 > 255) { out = 'expected byte $00-$FF, got "' + ag(1) + '"'; break; }
        out = [0x20 | (p1 << 1), v1]; break;
      }

      case 'ISZ': {
        var r1 = parseReg(ag(0));
        if (r1 < 0) { out = 'expected register R0-R15, got "' + ag(0) + '"'; break; }
        var a1 = addr8(ag(1));
        if (a1 === null) { out = 'expected address or label, got "' + ag(1) + '"'; break; }
        out = [0x70 | r1, a1]; break;
      }

      case 'JCN': {
        var cu = ag(0).toUpperCase();
        var c1 = (cu in COND) ? COND[cu] : parseNum(ag(0));
        if (c1 === null || c1 < 0 || c1 > 15) { out = 'expected condition AZ/CN/TN/CZ/TZ/AN or 0-F, got "' + ag(0) + '"'; break; }
        var a2 = addr8(ag(1));
        if (a2 === null) { out = 'expected address or label, got "' + ag(1) + '"'; break; }
        out = [0x10 | c1, a2]; break;
      }

      case 'JUN': case 'JMS': {
        var a3 = addr12(ag(0));
        if (a3 === null) { out = 'expected address or label, got "' + ag(0) + '"'; break; }
        out = [(mn==='JUN'?0x40:0x50) | ((a3>>8)&0xF), a3&0xFF]; break;
      }

      default: out = 'unknown mnemonic "' + mn + '"';
    }

    if (typeof out === 'string') return { error: 'Line ' + ln + ': ' + out };
    if (!out) return { error: 'Line ' + ln + ': internal error for ' + mn };
    for (var b = 0; b < out.length; b++) bytes.push(out[b]);
  }

  if (!bytes.length) return { error: 'No instructions found.' };
  var hex = bytes.map(function(b){ return ('0'+(b&0xFF).toString(16).toUpperCase()).slice(-2); }).join(' ');
  return { hex: hex };
}