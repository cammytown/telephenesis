// v0.02
/*
	e : element
	s : state

	d : drift
	l : loop
	m : map
*/

export default Spc;

import cor from './cor';
import Anm from './anm';


function Spc(e) {
	/// a blurred animation for going to a point over space that isn't loaded
	/// make mov() generic so you can get places without using the formula
	/// background flt optionally independent of spc.map

	var me = this;
	me.e = document.getElementById(e);
	me.s = 1;

	me.map = document.getElementById('map'); ///
	var lyr = document.getElementsByClassName('lyr'); /// ByClassName

	me.x = me.map.offsetLeft;
	me.y = me.map.offsetTop;

	var targetCenter = false;
	var centering = false;

	var bfr = 3; ///
	var seg = 500; ///

	me.map.style.left = me.map.offsetLeft+'px';
	me.map.style.top = me.map.offsetTop+'px';
	for(var i = lyr.length - 1; i >= 0; i--) {
		lyr[i].style.backgroundPosition = me.map.offsetLeft/(1+i*0.5)+'px '
			+ me.map.offsetTop/(1+i*0.5)+'px';
	}

	var xl; var yl;
	var xc = 0; var yc = 0;
	var ld = {};

	me.moveCallbacks = [];

	me.Vec2 = class {
		constructor(x, y) {
			this.x = x;
			this.y = y;
		}

		subtract(otherVec2) {
			return new me.Vec2(this.x - otherVec2.x, this.y - otherVec2.y);
		}

		scale(amount) {
			return new me.Vec2(this.x * amount, this.y * amount);
		}

		getMagnitude() {
			return Math.sqrt(this.x * this.x + this.y * this.y);
		}

		normalize() {
			var magnitude = this.getMagnitude();
			return new me.Vec2(this.x / magnitude, this.y / magnitude);
		}
	}

	me.set = function(x, y) {
		me.x = x;
		me.y = y;

		me.map.style.left = x+'px'; me.map.style.top = y+'px';

		for(var i = lyr.length - 1; i >= 0; i--) {
			lyr[i].style.backgroundPosition = x/(1+i*0.5)+'px'+' '+y/(1+i*0.5)+'px';
		}

		for (var callbackIndex = 0; callbackIndex < me.moveCallbacks.length; callbackIndex++) {
			me.moveCallbacks[callbackIndex](x, y);
		}
	}

	function stepCenter(ms) {
		var curPos = new me.Vec2(me.x, me.y); /// use globally later
		var diff = targetCenter.subtract(curPos);
		var distance = diff.getMagnitude();
		// console.log(distance);
		// var speed = 9;
		var speed = Math.max(Math.min(distance / 25, 25), 1);

		if(distance > speed) {
			var change = diff.normalize().scale(speed);
			me.set(me.x + change.x, me.y + change.y); ///
			window.requestAnimationFrame(stepCenter);
		} else {
			me.set(targetCenter.x, targetCenter.y);
			centering = false;
		}
	}

	/// requires anm
	/// if ctr is called again before anm is finished, stop first anm and start a new one
	me.ctr = function(x, y) {
		/// get rid of these / fix up architecture:
		x = -x; y = -y;
		x += window.innerWidth/2;
		y += window.innerHeight/2;

		targetCenter = new me.Vec2(x, y);

		if(!centering) {
			centering = true;
			window.requestAnimationFrame(stepCenter);
		}

		// for(var i = lyr.length - 1; i >= 0; i--) {
		// 	Anm.animate(lyr[i], 'backgroundPosition', x/(1+i*0.5)+'px '+y/(1+i*0.5)+'px');
		// }

		// Anm.animate(me.map, 'left', x+'px');
		// Anm.animate(me.map, 'top', y+'px');
	}

	var fltVelocity = { x: 0, y: 0 };
	var fltDirection = -1;
	var fltStart;
	me.flt = function() {
		if(me.s == 'flt') { me.s = 'active'; return false; }
		me.s = 'flt';

		fltStart = performance.now();

		function l(ms) {
			var msSinceStart = performance.now() - fltStart;

			/// optimization:
			if(msSinceStart < 1000) {
				var v = msSinceStart / 1000;
				fltVelocity.x = fltDirection * v;
				fltVelocity.y = fltDirection * v;
			} else {
				fltVelocity.x = fltDirection;
				fltVelocity.y = fltDirection;

				if(msSinceStart > 19000) {
					if(msSinceStart < 20000) {
						var v = (1000 - (msSinceStart % 19000)) / 1000;
						fltVelocity.x = fltDirection * v;
						fltVelocity.y = fltDirection * v;
					} else {
						fltDirection *= -1;
						fltStart = new Date();
					}

				}
			}

			var x = me.x += fltVelocity.x;
			var y = me.y += fltVelocity.y;
			me.x = x;
			me.y = y;

			me.set(x, y);

			if(me.s == 'flt') window.requestAnimationFrame(l);
			// if(me.s == 'flt') setTimeout(l, 50);
		}

		l();
	}

	/// wip
	me.hvr = function() {
		me.s = 'hvr';
		function l1() {
			var x = me.x + dx;
			var y = me.y + dy;
			me.x = x;
			me.y = y;

			me.set(x, y);

			if(me.s == 'hvr') window.requestAnimationFrame(l);
			// if(me.s == 'hvr') setTimeout(l1, 200);
		}

		function l2() {
			dx = Math.random();
		}

		l1();
	}

	function grb(e) {
		if(!me.s || e.button == 2) return false;
		xl = e.clientX; yl = e.clientY;
		cor.al(me.e, 'mousemove', drg);
		me.e.className = 'act';
	}

	function rls(e) {
		cor.rl(me.e, 'mousemove', drg);
		me.e.removeAttribute('class');
	}

	function drg(e) {
		var x = e.clientX - xl + me.x;
		var y = e.clientY - yl + me.y;
		// me.x = x;
		// me.y = y;

		xl = e.clientX; yl = e.clientY;

		me.set(x, y);
		// me.ctr(Math.floor(x), Math.floor(y));
		// centering = true;
		// targetCenter = new me.Vec2(x, y);
		// mov(x, y);
	}

	function mov(x, y) { /// x and y just added
		me.set(x, y);
		// var xb = x + (xc*seg);
		// var yb = y + (yc*seg);

		// if(xb > 500) { xc--; chk('l'); }
		// else if(xb < -500) { xc++; chk('r'); }
		// else if(yb > 500) { yc--; chk('u'); }
		// else if(yb < -500) { yc++; chk('d'); }
	}

	function chk(d) {
		for(var i = bfr*2; i >= 0; i--) {
			///:
			switch(d) {
				case 'u':
					var x = xc - bfr + i;
					var y = yc + bfr;
					break;
				case 'd':
					var x = xc - bfr + i;
					var y = yc - bfr;
					break;
				case 'l':
					var x = xc - bfr;
					var y = yc - bfr + i;
					break;
				case 'r':
					var x = xc + bfr;
					var y = yc - bfr + i;
					break;
			}

			if(!(x+'_'+y in ld)) {
				ld[x+'_'+y] = true;
				lds(x*seg, y*seg);
			}
		}
	}

	/// make generic, move to telep:
	function lds(x, y) {

	}

	cor.al(me.e, 'mousedown', grb);
	cor.al(window, 'mouseup', rls);
	//al(window, 'mouseout', rls);
}
