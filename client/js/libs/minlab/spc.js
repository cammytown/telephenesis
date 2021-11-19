// v0.02
/*
	s : state

	d : drift
	l : loop
	m : map
*/

export default new Spc();
// export default Spc;

import cor from './cor';
import Anm from './anm';

function Spc(elementID = "spc") {
	/// a blurred animation for going to a point over space that isn't loaded
	/// make mov() generic so you can get places without using the formula
	/// background flt optionally independent of spc.map

	var me = this;

	document.addEventListener("DOMContentLoaded", init); //// backwards-compatibility

	var targetCenter = false;
	var animating = false;

	var bfr = 3; ///
	var seg = 500; ///

	var lastX;
	var lastY;
	var xc = 0; var yc = 0;
	var ld = {};
	var lyr;

	me.moveCallbacks = [];

	var animationUpdateCallback = false;

	function init() {
		me.element = document.getElementById(elementID);
		me.map = document.getElementById('map'); ///
		lyr = document.getElementsByClassName('lyr'); /// ByClassName

		cor.al(me.element, 'mousedown', grb);
		//cor.al(me.element, 'mouseup', rls);
		cor.al(window, 'mouseup', rls);
		cor.al(window, 'dragend', rls);
		//al(window, 'mouseout', rls);

		me.s = 1;
		me.x = me.map.offsetLeft;
		me.y = me.map.offsetTop;

		me.map.style.left = me.map.offsetLeft+'px';
		me.map.style.top = me.map.offsetTop+'px';
		for(var i = lyr.length - 1; i >= 0; i--) {
			lyr[i].style.backgroundPosition = me.map.offsetLeft/(1+i*0.5)+'px '
				+ me.map.offsetTop/(1+i*0.5)+'px';
		}
	}

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

	function stepTowardsPos(ms) {
		// If animation has been cancelled (i.e. user clicked):
		if(!animating) {
			return false;
		}

		//window.requestAnimationFrame(stepTowardsPos);
		//me.set(me.x + 1, me.y + 1);
		//return false;

		var curPos = new me.Vec2(me.x, me.y); /// use globally later
		var diff = targetCenter.subtract(curPos);
		var distance = diff.getMagnitude();
		var speed = Math.max(Math.min(distance / 25, 25), 1);

		// If there's still distance to move after this frame:
		if(distance > speed) {
			var change = diff.normalize().scale(speed);
			me.set(me.x + change.x, me.y + change.y); ///
			window.requestAnimationFrame(stepTowardsPos);
		// Otherwise, just set it to the target position:
		} else {
			me.set(targetCenter.x, targetCenter.y);
			animating = false;
		}

		if(animationUpdateCallback) {
			animationUpdateCallback(ms);
		}
	}

	me.ctr = function(x, y, callback = false) {
		/// get rid of these / fix up architecture:
		x = -x; y = -y;
		x += window.innerWidth/2;
		y += window.innerHeight/2;

		targetCenter = new me.Vec2(x, y);
		animationUpdateCallback = callback; //@TODO probably improve architecture

		if(!animating) {
			animating = true;
			window.requestAnimationFrame(stepTowardsPos);
		}

		// for(var i = lyr.length - 1; i >= 0; i--) {
		// 	Anm.animate(lyr[i], 'backgroundPosition', x/(1+i*0.5)+'px '+y/(1+i*0.5)+'px');
		// }

		// Anm.animate(me.map, 'left', x+'px');
		// Anm.animate(me.map, 'top', y+'px');
	}

	var fltVelocity = { x: 0, y: 0 };
	var fltDirection = -1;
	var fltStartPosition;
	var fltStartTime;
	me.flt = function(on = true) {
		if(!on) { // turning off
			me.ctr(fltStartPosition);
		} else {
			if(me.s == 'flt') { me.s = 'active'; return false; }
			me.s = 'flt';

			fltStartPosition = { x: me.x, y: me.y };
			fltStartTime = performance.now();

			tickFrame();

		}
	}

	function tickFrame(ms) {
		var msSinceStart = performance.now() - fltStartTime;

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
					fltStartTime = new Date();
				}

			}
		}

		var x = me.x += fltVelocity.x;
		var y = me.y += fltVelocity.y;
		me.x = x;
		me.y = y;

		me.set(x, y);

		if(me.s == 'flt') {
			window.requestAnimationFrame(tickFrame);
		}

		// if(me.s == 'flt') setTimeout(l, 50);
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
		///@TODO check if e.target == .spc or .lyr at least as config option
		if(!me.s || e.button == 2) {
			return false;
		}

		// Cancel any panning animation:
		animating = false;

		lastX = e.clientX;
		lastY = e.clientY;

		cor.al(me.element, 'mousemove', drg);
		me.element.className = 'act';
	}

	function rls(e) {
		cor.rl(me.element, 'mousemove', drg);
		me.element.removeAttribute('class');
	}

	function drg(e) {
		var x = e.clientX - lastX + me.x;
		var y = e.clientY - lastY + me.y;
		// me.x = x;
		// me.y = y;

		lastX = e.clientX; lastY = e.clientY;

		me.set(x, y);
		// me.ctr(Math.floor(x), Math.floor(y));
		// animating = true;
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
}
