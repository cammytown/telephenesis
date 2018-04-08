export default Aud;

import cor from './cor';

function Aud(eid) {
	//loa = (typeof loa === "function") ? false : loa;
	//pla = (typeof pla === "undefined") ? "aud_pla" : pla;
	//pau = (typeof pau === "undefined") ? "aud_pau" : pau;

	var aud = this;
	aud.e = document.getElementById(eid);
	aud.e.loop = false;
	aud.t = null;
	aud.dec = null;
	aud.aut = true;

	aud.d = null; aud.m = null; aud.s = null;

	aud.pl = function() {
		console.log('tryin');
		aud.d = aud.e.duration | 0;
		aud.m = aud.d / 60 | 0;
		aud.s = aud.d - aud.m*60 + '';
		if(aud.s.length<2) aud.s = "0"+aud.s;
		aud.e.play();
		return true;
	}

	aud.pa = function() {
		aud.e.pause();
		return true;
	}

	aud.st = function() {
		aud.e.pause();
		aud.e.currentTime = 0;

		return true;
	}

	aud.ld = function(src, autoplay = true) {
		if(autoplay) {
			console.log('yes?');
			cor.al(aud.e, 'canplay', aud.pl);
			cor.al(aud.e, 'error', aud.er);
		} else {
			console.log('no?');
			cor.rl(aud.e, 'canplay', aud.pl);
			cor.rl(aud.e, 'error', aud.er);
		}

		console.log(src);

		aud.e.setAttribute('src', src);
		//aud.play();
	}

	aud.er = function() {
		////
		console.log("Audio Error:");
		console.log(aud.e.error);
	}

	aud.up = function() {
		var t = aud.e.currentTime | 0;
		var m = t/60 | 0;
		var s = (t-m*60)+'';
		if(s.length<2) s = "0"+s;

		aud.t = m+':'+s+' / '+aud.m+':'+aud.s;
		aud.dec = t/aud.d;
	}

	if(aud.e.addEventListener) aud.e.addEventListener('timeupdate', aud.up, false);
	else if(aud.e.attachEvent) aud.e.attachEvent('ontimeupdate', aud.up);
}