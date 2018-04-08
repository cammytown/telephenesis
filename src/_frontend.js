/// no longer doing this because of imports, right?:

// var aud;
// var anm;
var val;
// var spc;
var telep;
var clr;
var limbo;

import cor from './cor.js';
// import './upl.js';
// import './ajx.js';
// import Aud from './aud.js';
// import { Spc } from './spc.js';
import { Val } from './val.js';
import Anm from './anm';
// import { Clr } from './clr.js';
import { Telep } from './telep.js';

cor.al(window, 'load', function() {
	limbo = document.getElementById('limbo');

	// aud = new Aud('aud');
	// anm = new Anm();
	val = new Val();
	// clr = new Clr();
	// spc = new Spc('spc');

	telep = new Telep();
	telep.init();
});
