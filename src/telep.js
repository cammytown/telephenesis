export { Telep };

import cor from './cor';
import Spc from './spc';
import Anm from './anm';
import Aud from './aud';
import Upl from './upl';
import {ajx} from './ajx';
import Clr from './clr';

function Telep() {
	var me = this;

	var playing_star = false;
	var acting_star = false;
	var active_box = false;
	var state = { path: window.location.pathname, updating: false, ref: false };

	var aud;
	var spc;
	var uictx;

	var menuToggleElement = document.getElementsByClassName('menuToggle')[0]; ////

	var queuedLines = [];

	me.init = function() {
		// cor.al(spc.e, 'mousedown', function() {  });
		// cor.al(spc.e, 'mousemove', function() { dragged++; dragged = true; });
		// var dragged = 0;
		// function placerdown(e) {
		// 	dragged = false;
		// 	cor.al(spc.e, 'mouseup', placerclick);
		// }

		aud = new Aud('aud');
		spc = new Spc('spcE');

		cor.al(aud.e, 'timeupdate', function() {
			// if(time) {
				playing_star.getElementsByClassName('time')[0].innerHTML = aud.t;
			// }
		});

		cor.al(aud.e, 'ended', function() {
			cor.rc(playing_star, 'active');
		});

		var canvas = document.getElementById('uiEffects');
		canvas.width = document.body.offsetWidth;
		canvas.height = document.body.offsetHeight;
		uictx = canvas.getContext('2d');

		// spc.moveCallbacks.push(function(ox, oy) {
		spc.moveCallbacks.push(function(x, y) {
			canvas.style.left = x + 'px';
			canvas.style.top = y + 'px';
			// uictx.style.left = parseInt();
			// uictx.style.top = parseInt(uictx.style.top) + oy + 'px';
		});

		/// temporary?:
		var active_check = document.getElementsByClassName('active uibox');
		if(active_check) active_box = active_check[0];

		/* stars */
		var stars = document.getElementsByClassName('star');
		for (var starIndex = 0; starIndex < stars.length; starIndex++) {
			var star = stars[starIndex];
			if(star.getAttribute('data-prev')) {
				var sourceId = star.getAttribute('data-prev');
				if(parseInt(sourceId) > 0) {
					var sourceStar = document.getElementById('s' + sourceId);

					sourceStar.setAttribute('data-next', star.id.split('s')[1]);

					queuedLines.push({
						startX: parseInt(sourceStar.style.left),
						startY: parseInt(sourceStar.style.top),
						endX: parseInt(star.style.left),
						endY: parseInt(star.style.top),
						tier: parseInt(star.getAttribute('data-tier'))
					});
				}
			}
		}

		var startms = performance.now();
		function drawLineStep(ms) {
			uictx.clearRect(0, 0, canvas.width, canvas.height);

			var elapsedms = ms - startms;
			for (var lineIndex = 0; lineIndex < queuedLines.length; lineIndex++) {
				var line = queuedLines[lineIndex];

				var progress = (elapsedms - ((line.tier - 1) * 300)) / 1000;
				if(progress < 0) {
					continue;
				}

				if(progress >= 1) {
					progress = 1;
					// queuedLines.splice(queuedLines.indexOf(line), 1);
				}

				var vec = [line.endX - line.startX, line.endY - line.startY];
				var mag = Math.sqrt(vec[0] * vec[0], vec[1] * vec[1]);
				var currentDistance = mag * progress;
				var drawVec = [
					line.startX + (vec[0] / mag * currentDistance),
					line.startY + (vec[1] / mag * currentDistance)
				];

				uictx.strokeStyle = 'rgb(200, 200, 200)';
				uictx.beginPath();
				uictx.moveTo(line.startX, line.startY);
				uictx.lineTo(drawVec[0], drawVec[1]);
				uictx.stroke();
			}

			/// optimize
			if(queuedLines.length) {
				window.requestAnimationFrame(drawLineStep); ////
			}
		}

		window.requestAnimationFrame(drawLineStep);

		/* shortcuts */
		cor.al(window, 'keydown', function(e) {
			switch(e.keyCode) {
				case 39:
					e.preventDefault();
					if(playing_star) {
						var nsid = playing_star.getAttribute('data-next');
						/// if next star isn't loaded? if there is no next star?
						var nstar = document.getElementById('s'+nsid);
						load(nstar);
					}
					break;

				case 37:
					e.preventDefault();
					if(playing_star) {
						var lsid = playing_star.getAttribute('data-prev');
						/// if prev star isn't loaded?
						var lstar = document.getElementById('s'+lsid);
						load(lstar);
					}
					break;

				case 32:
					//e.preventDefault();
					///if(e.target)
					break;

				case 27:
					state.updating = true;
					navigate('/');
					break;
			}
		});

		/* navigation */
		cor.al(spc.e, 'click', function(e) {
			clear();
			if(e.target.parentNode.id == 'spc' && state.path != '/') {
				state.updating = true;
				navigate('/');
			}
		});
		cor.al(spc.e, 'contextmenu', context);

		cor.al(menuToggleElement, 'click', togglemenu);

		var closes = document.getElementsByClassName('close');
		if(closes.length) for(var i=0, j=closes.length; i<j; i++) {
			cor.al(closes[i], 'click', function(e) {
				e.preventDefault();
				navigate('/');
			});
		}

		var as = document.getElementsByTagName('a');
		for(var i=0, j=as.length; i<j; i++) {
			if(as[i].href && !cor.cc(as[i], 'nojax')) {
				cor.al(as[i], 'click', function(e) {
					e.preventDefault();
					var path = e.target.pathname;
					state.updating = true;
					if(cor.cc(this.parentNode, 'star')) {
						navigate(path);
					} else {
						if(state.path == path) navigate('/');
						else navigate(path);
					}
				});
			}
		}

		/* forms */
		cor.al(document.getElementById('submission'), 'change', initializeCreation);

		var forms = document.getElementsByTagName('form');
		for(var i=0, j=forms.length; i<j; i++) {
			if(!cor.cc(forms[i], 'nojax')) {
				cor.al(forms[i], 'submit', pidgeon);
			}
		}

		/* history */
		cor.al(window, 'popstate', chrono);
		history.replaceState(state, 'telephenesis', state.path) /// doesn't get title

		if(state.path && state.path != 'login' && state.path != 'register') {
			//load(document.getElementById('s'+state.path));

			///:
			var parts = state.path.split('/');
			var operation = parts[1];
			if(operation == 'invite' || operation=='login' || operation=='register') return false;

			navigate(state.path);
		}
	}

	/// put toggle and menu in same element for active?
	function togglemenu(e) {
		var menu = document.getElementById('menu');
		var check = cor.cc(menu, 'active');
		if(check) {
			e.target.innerHTML = '|||';
			cor.rc(e.target, 'active');
			cor.rc(menu, 'active');
		} else {
			e.target.innerHTML = '&rarr;';
			cor.ac(e.target, 'active');
			cor.ac(menu, 'active');
		}
	}


	function chrono(e) {
		state.updating = false;
		if(!e.state) {
			console.log('NOW');
			navigate(window.location.pathname);
		}
		else {
			state.path = e.state.path;
			navigate(e.state.path);
		}
	}

	function navigate(path) {
		var parts = path.split('/');
		var operation = parts[1];

		if(operation.length && !isNaN(operation)) {
			var star = document.getElementById('s'+operation)
			load(star);
			if(state.path == path) return true;
		} else switch(operation) {
			/// refactor:
			case 'help':
			case 'login':
			case 'register':
			case 'settings':
			case 'invite':
			case 'create':
			case 'recreate':
			case 'help': {
				clear(); ///
				close();
				open(operation);
			} break;

			case 'moveStar': {
				initializeMove();
				// return true;
			} break;

			case 'recolorStar': {
				initializeRecolor();
				// return true;
			} break;

			case 'logout': {
				close();
				logout();
				return true;
			} break;

			default: {
				close();
				spc.s = 'active';
			}
		}

		if(state.updating) {
			state.path = path;
			history.pushState(state, 'telephenesis : ' + operation, path);
		}

		///:
		function close(box) {
			box = (typeof box === "undefined") ? active_box : box;
			active_box = false;

			///:
			menuToggleElement.innerHTML = '|||';
			cor.rc(menuToggleElement, 'active');
			cor.rc(document.getElementById('menu'), 'active');

			if(box) {
				Anm.fadeOut(box, 250, function() {
					limbo.appendChild(box);
				});
			}
		}

		function open(box) {
			var box = document.getElementById(box);
			active_box = box;
			document.body.appendChild(box);
			Anm.fadeIn(box);
			spc.flt(true)
		}
	}

	function initializeRecolor() {
		/// consolidate:

		var colorwheel = document.getElementById('colorwheel');
		acting_star.appendChild(colorwheel);
		Anm.fadeIn(colorwheel);

		var x = parseInt(acting_star.style.left);
		var y = parseInt(acting_star.style.top);
		spc.ctr(x, y); /// create callback function for ctr? currently using placeable fadeOut delay

		//// preventmovement?

		var starLink = acting_star.getElementsByTagName('a')[0];

		cor.al(colorwheel, 'mousemove', getColor);
		cor.al(colorwheel, 'click', function() {
			cor.rl(colorwheel, 'mousemove', getColor);

			var newrgb = starLink.style.backgroundColor.substr(4).slice(0, -1); /// bad code / maybe unreliable
			Anm.fadeOut(colorwheel);

			var p = 'rgb='+newrgb+'&sid='+acting_star.id.split('s')[1];
			ajx('/ajax/recolor', p, function(d) {
				var r = JSON.parse(d);
			});

			acting_star = false;
		});

		function getColor(e) {
			var cx = -(x + (spc.map.offsetLeft - e.clientX));
			var cy = (y + (spc.map.offsetTop - e.clientY));

			var angle = -Math.atan2(cy, cx) * 180 / Math.PI + 180;

			var selectedhue;
			if(angle>0 && angle<60) selectedhue = 110;
			else if(angle>60 && angle<120) selectedhue = 60;
			else if(angle>120 && angle<180) selectedhue = 25;
			else if(angle>180 && angle<240) selectedhue = 0;
			else if(angle>240 && angle<300) selectedhue = 270;
			else if(angle>300) selectedhue = 240;

			starLink.style.backgroundColor = 'hsl('+selectedhue+', 45%, 80%)';
		}
	}

	function initializeMove() {
		cor.ac(acting_star, 'moving');

		setTimeout(function() { ////
			cor.al(spc.e, 'click', clickStarMove);
		}, 200);
		cor.al(spc.e, 'mousemove', mouseMoveStarMove);

		function mouseMoveStarMove(e) {
			acting_star.style.left = e.clientX + 'px'; /// new variable; moving_star ?
			acting_star.style.top = e.clientY + 'px'; /// new variable; moving_star ?
		}

		function clickStarMove(e) {
			var x = e.clientX - spc.map.offsetLeft;
			var y = e.clientY - spc.map.offsetTop;
			var p = 'x='+x+'&y='+y+'&sid='+acting_star.id.split('s')[1];
			ajx('/ajax/move', p, function(d) {
				var r = JSON.parse(d);
			}); /// could be confused with place

			acting_star = false;

			cor.rl(spc.e, 'mousemove', mouseMoveStarMove);
			cor.rl(spc.e, 'click', clickStarMove);
		}

	}

	function context(e) {
		e.preventDefault();
		e.stopPropagation();

		clear(); /// ?

		var check = cor.cc(e.target.parentNode, 'star');
		if(check) {
			var star = e.target.parentNode;
			var sid = star.id.split('s')[1];

			//document.getElementById('download').href = '/f/'+sid+'.mp3';
			acting_star = star;

			var menu = document.getElementById('starMenu');
			menu.style.left = parseInt(star.style.left) + 12 + 'px';
			menu.style.top = parseInt(star.style.top) - 5 + 'px';

			cor.al(menu.children[0], 'click', function() { bookmark(star); });
			menu.children[1].href = sid+'/recreate';

			spc.map.appendChild(menu);
		} else {
			clear();
			acting_star = false;

			var menu = document.getElementById('galaxyMenu');
			menu.style.left = e.clientX + 'px';
			menu.style.top = e.clientY + 'px';
			document.body.appendChild(menu);
		}
	}


	function load(star) {
		var sid = star.id.split('s')[1];
		// var sid = star.getAttribute('data-id').split('s')[1];

		if(star == playing_star) {
			aud.e.paused ? aud.pl() : aud.pa();
		} else {
			cor.rc(playing_star, "active");

			playing_star = star;
			cor.ac(star, "active");

			var time = star.getElementsByTagName('span')[1];

			aud.ld('/music/'+sid+'.mp3');

		}
	}

	function logout() {
		ajx('/ajax/logout', false, function(d) {
			var r = JSON.parse(d);
			if(r.error) console.log(r.error);
			else {
				var login = document.getElementById('login');
				login.children[1].value = "";
				cor.rc(document.body, 'in');
				cor.rc(document.body, 'creator');
			}
		});
	}

	function pidgeon(e) {
		e.preventDefault();

		var form = e.target;
		var children = form.children;
		var op = form.id;

		var p = "";
		for(var i=0, j=children.length-1; i<j; i++) {
			if(i) p += "&";
			p += children[i].name + "=" + children[i].value;
		}

		ajx('/ajax/'+op, p, function(d) {
			var r = JSON.parse(d);
			if(r.error) console.log(r.error);
			else {
				state.updating = true;

				///
				window.history.go(-1);
				if(state.path.split('/')[1] == 'invite') window.reload();
				//navigate('/'); /// previous screen

				if(op == 'register' || op == 'login') cor.ac(document.body, 'in');
				if(op == 'login' && r.lv) cor.ac(document.body, 'creator');
			}
		});
	}

	function initializeCreation() {
		/// create back and forth navigation
		/// could use some attention

		state.updating = false;
		navigate('/');
		// document.body.className = null;
		//spc.ctr(0, 0);

		var lsid = acting_star ? parseInt(acting_star.id.split('s')[1]) : 0;
		var file = document.getElementById('submission');
		var upl = new Upl('/ajax/upload/'+lsid, file, progress, complete);

		var placed = false;
		var uploaded = false;
		var newrgb = false;
		var nsid = false;

		var placer = document.getElementById('placer').cloneNode(true); /// deep parameter in IE8??
		var link = placer.children[0];

		var percent = placer.children[1];
		percent.className = 'progress';
		spc.map.appendChild(placer);

		if(!lsid) {
			cor.al(spc.e, 'mousemove', placermove);
			cor.al(spc.e, 'click', placerclick);
		} else {
			var placeable = document.getElementById('placeable');
			spc.map.appendChild(placeable);

			var current_x = parseInt(acting_star.style.left);
			var current_y = parseInt(acting_star.style.top);
			spc.ctr(current_x, current_y);

			placeable.style.left = current_x - 77 + 'px';
			placeable.style.top = current_y - 73 + 'px';
			cor.al(placeable, 'mousemove', placermove);
			cor.al(placeable, 'click', placerclick);
		}

		function progress(e) {
			if (e.lengthComputable) {
				var progress = e.loaded / e.total;
				percent.innerHTML = Math.floor(progress*100) + '% uploaded';
				if(progress == 1) { /// safe?
					// complete();
				}

				//link.style.background = 'rgba(100, 255, 100', '+progress+')';
			} else {
				//console.log('total size is unknown');
			}
		}

		function complete(e) {
			uploaded = true;

			var d = e.target.responseText;
			var r = JSON.parse(d);

			nsid = r.sid;
			placer.id = 's'+nsid;
			placer.setAttribute('data-prev', lsid);
			if(placed) {
				finish(r.sid, parseInt(placer.style.left), parseInt(placer.style.top), newrgb);
			}
		}

		function placermove(e) {
			var x = e.clientX - spc.map.offsetLeft;
			var y = e.clientY - spc.map.offsetTop;
			placer.style.left = x + 'px';
			placer.style.top = y + 'px';
		}

		function placerclick(e) { // (initiates coloring)
			var x = e.clientX - spc.map.offsetLeft;
			var y = e.clientY - spc.map.offsetTop;
			placer.style.left = x + 'px';
			placer.style.top = y + 'px';

			spc.ctr(x, y); /// create callback function for ctr? currently using placeable fadeOut delay

			//// prevent movement??

			if(!lsid) {
				cor.rl(spc.e, 'mousemove', placermove);
				cor.rl(spc.e, 'click', placerclick);

				var colorwheel = document.getElementById('colorwheel');
				placer.appendChild(colorwheel);
				Anm.fadeIn(colorwheel);

				cor.al(colorwheel, 'mousemove', getColor);
				cor.al(colorwheel, 'click', function() {
					cor.rl(colorwheel, 'mousemove', getColor);

					newrgb = link.style.backgroundColor.substr(4).slice(0, -1); /// bad code / maybe unreliable
					Anm.fadeOut(colorwheel);

					if(!uploaded) placed = true;
					else finish(placer.id.split('s')[1], x, y, newrgb);
				});

				function getColor(e) {
					var cx = -(x + (spc.map.offsetLeft - e.clientX));
					var cy = (y + (spc.map.offsetTop - e.clientY));

					var angle = -Math.atan2(cy, cx) * 180 / Math.PI + 180;

					var selectedhue;
					if(angle>0 && angle<60) selectedhue = 110;
					else if(angle>60 && angle<120) selectedhue = 60;
					else if(angle>120 && angle<180) selectedhue = 25;
					else if(angle>180 && angle<240) selectedhue = 0;
					else if(angle>240 && angle<300) selectedhue = 270;
					else if(angle>300) selectedhue = 240;

					link.style.backgroundColor = 'hsl('+selectedhue+', 45%, 80%)';
				}
			} else {
				cor.rl(placeable, 'mousemove', placermove);
				cor.rl(placeable, 'click', placerclick);

				Anm.fadeOut(placeable);

				var colorer = document.getElementById('colorer');
				var rgb = acting_star.children[0].style.backgroundColor.substr(4).split(',');
				var hsl = Clr.rgb(rgb[0], rgb[1], parseInt(rgb[2]));
				colorer.children[0].style.background = 'hsl('+(hsl[0]-17)+', 45%, 80%)';
				colorer.children[1].style.background = 'hsl('+(hsl[0]+17)+', 45%, 80%)';
				placer.appendChild(colorer);

				Anm.fadeIn(colorer, 250, function() {
					cor.al(colorer, 'mouseover', function(e) {
						link.style.background = e.target.style.background;
					});

					cor.al(colorer, 'click', function(e) { // (finish)
						newrgb = e.target.style.backgroundColor.substr(4).slice(0, -1);
						link.style.background = e.target.style.background;

						Anm.fadeOut(colorer, 300, function() {
							colorer.parentNode.removeChild(colorer);
						});

						limbo.appendChild(placeable);

						document.body.removeAttribute('class');

						spc.on = true;

						if(!uploaded) { placed = true; Anm.fadeOut(colorer); console.log(newrgb); }
						else finish(placer.id.split('s')[1], x, y, newrgb);
					});
				});
			}

			// 	guide.innerHTML = "Now choose a color. You can only shift the color 11 degrees from the previous star.";
		}

		function finish(sid, x, y, rgb) {
			window.onbeforeunload = false;

			///cor.al(link, 'click', )

			var p = 'x='+x+'&y='+y+'&rgb='+rgb+'&sid='+sid; ///
			ajx('/ajax/place', p, function(d) {
				// console.log(d);
				var r = JSON.parse(d);
				placer.className = 'star';
				percent.className = 'text name';
				percent.innerHTML = r.creator;

				link.href = '/'+nsid;
				cor.al(link, 'click', function(e) {
					e.preventDefault();
					state.updating = true;
					navigate('/'+nsid);
				});
			});
		}
	}

	// 	// tutorial
	// 	var guide = document.createElement('div');
	// 	guide.className = 'tutorial small';
	// 	guide.style.left = -100 + 'px';
	// 	guide.style.top = -30 + 'px';
	// 	var text = document.createElement('div');
	// 	text.innerHTML = "Uploading your track. Let's place the origin star of your constellation.";
	// 	guide.appendChild(text);
	// 	spc.map.appendChild(guide);

	// 	var placer = document.createElement('div');
	// 	placer.className = 'star placer';
	// 	var link = document.createElement('a');
	// 	placer.appendChild(link);
	// 	var progress = document.createElement('span');
	// 	progress.className = 'progress';
	// 	progress.style.display = 'none';
	// 	placer.appendChild(progress);
	// 	spc.map.appendChild(placer);

	// 	var cwheel = document.createElement('div');
	// 	cwheel.className = 'wheel';
	// 	cwheel.style.display = 'none';
	// 	placer.appendChild(cwheel);

	// 	cor.al(spc.e, 'mousedown', placerdown);
	// 	cor.al(spc.e, 'mousemove', placermove);

	// 	/// move concept to either spc or telep global or 
	// 	var dragged = 0;
	// 	function placerdown(e) {
	// 		dragged = false;
	// 		cor.al(spc.e, 'mouseup', placerclick);
	// 	}

	// 	// placement
	// 	function placermove(e) {
	// 		var x = e.clientX - spc.map.offsetLeft;
	// 		var y = e.clientY - spc.map.offsetTop;
	// 		placer.style.left = x + 'px';
	// 		placer.style.top = y + 'px';
	// 		guide.style.left = x + 35 + 'px';
	// 		guide.style.top = y -35 + 'px'

	// 		dragged++;
	// 	}

	// 	function placerclick(e) {
	// 		if(dragged > 1) {
	// 			dragged = false;
	// 			return false;
	// 		}

	// 		/// ?:
	// 		cor.rl(spc.e, 'mousedown', placerdown);
	// 		cor.rl(spc.e, 'mousemove', placermove);
	// 		cor.rl(spc.e, 'mouseup', placerclick);

	// 		var x = e.clientX - spc.map.offsetLeft;
	// 		var y = e.clientY - spc.map.offsetTop;
	// 		placer.style.left = x + 'px';
	// 		placer.style.top = y + 'px';
	// 		placer.className = 'star';

	// 		Anm.fadeIn(cwheel, 250, function() {

	// 		});

	// 		cor.al(cwheel, 'click', function() {
	// 			rgb = link.style.backgroundColor.substr(4).slice(0, -1)
	// 			cor.rl(cwheel, 'mousemove', getColor);
	// 			if(!uploaded) {
	// 				placed = true;
	// 				Anm.fadeOut(guide);
	// 				Anm.fadeOut(cwheel);
	// 				Anm.fadeIn(progress);
	// 			}
	// 			else finish(placer.id.split('s')[1], x, y, rgb);
	// 		});

	// 		cor.al(cwheel, 'mousemove', getColor);

	// 		function getColor(e) {
	// 			var cx = -(x + (spc.map.offsetLeft - e.clientX));
	// 			var cy = (y + (spc.map.offsetTop - e.clientY));

	// 			var angle = -Math.atan2(cy, cx) * 180 / Math.PI + 180;

	// 			var selectedhue;
	// 			if(angle>0 && angle<60) selectedhue = 110;
	// 			else if(angle>60 && angle<120) selectedhue = 60;
	// 			else if(angle>120 && angle<180) selectedhue = 25;
	// 			else if(angle>180 && angle<240) selectedhue = 0;
	// 			else if(angle>240 && angle<300) selectedhue = 270;
	// 			else if(angle>300) selectedhue = 240;

	// 			link.style.backgroundColor = 'hsl('+selectedhue+', 45%, 80%)';
	// 		}

	// 		Anm.fadeOut(guide, 250, function() {
	// 			guide.innerHTML = "Now choose a color.";
	// 			guide.style.left = x + 50 + 'px';
	// 			guide.style.top = y - 15 + 'px';
	// 			Anm.fadeIn(guide);
	// 		});
	// 	}

	// 	function finish(sid, x, y, rgb) {
	// 		window.onbeforeunload = false;

	// 		progress.style.display = null;
	// 		link.style.background = 'rgb('+rgb+')';
	// 		///cor.al(link, 'click', )

	// 		/// call as ajx callback?:
	// 		document.body.removeAttribute('class');
	// 		Anm.fadeOut(guide, 300, function() {
	// 			guide.parentNode.removeChild(guide);
	// 		});

	// 		Anm.fadeOut(cwheel, 300, function() {
	// 			cwheel.parentNode.removeChild(cwheel);
	// 		});

	// 		spc.on = true;

	// 		var p = 'x='+x+'&y='+y+'&rgb='+rgb+'&sid='+sid;
	// 		ajx('/ajax/place', p, function(d) {
	// 			var r = JSON.parse(d);
	// 			progress.className = 'text name';
	// 			progress.innerHTML = r.creator;

	// 			var code = window.location.pathname.split('/').pop();
	// 			console.log(code);
	// 			window.location = "/activate/"+code;
	// 		});
	// 	}
	// }












	function bookmark(star) {
		var sid = star.id.split('s')[1];
		var p = "sid="+sid;
		ajx('/ajax/bookmark', p, function(d) {
			var r = JSON.parse(d);
			if(r.success) {
				limbo.appendChild(document.getElementById('starMenu'));
			}
		});

		return false;
	}

	// visual functions
	function clear() {
		// var menus = document.getElementsByClassName('star menu');
		// if(menus.length) menus[0].className = 'star';
		limbo.appendChild(document.getElementById('starMenu'));
		limbo.appendChild(document.getElementById('galaxyMenu'));
	}





	/// (and it's cycle function)
	var cycling = false;
	me.spectrum = function(b) {
		var l = function() {
			if(cycling) {
				spc.e.style.backgroundColor = cycle();
				setTimeout(function() {
					l();
				}, 400);
			}
		}

		if(b) { cycling = true; l(); }
		else {
			cycling = false;
			spc.e.style.backgroundColor = null;
		}
	}


	me.invite = function(e) {
		/// can't load if not logged in
		/// create separate aud for sound-effects like this

		aud.ld('/audio/ticket.mp3');

		var ticket = document.getElementById('ticket');
		document.body.appendChild(ticket, limbo);
		Anm.fadeIn(ticket, 2750); ///
		spc.flt(true);

		e.preventDefault();
	}


}

///:
var fillR = 255;
var fillG = 0;
var fillB = 0;
var increment = 40
 
function cycle() {
    if (fillR == 255) {
        if (fillB > 0) {
            fillB = fillB - increment;
            if (fillB < 0) { fillB = 0; }
        }
        else {
            fillG = fillG + increment;
            if (fillG > 255) { fillG = 255; }
        }
    }
 
    if (fillG == 255) {
        if (fillR > 0) {
            fillR = fillR - increment;
            if (fillR < 0) { fillR = 0; }
        }
        else {
            fillB = fillB + increment;
            if (fillB > 255) { fillB = 255; }
        }
    }
 
    if (fillB == 255) {
        if (fillG > 0) {
            fillG = fillG - increment;
            if (fillG < 0) { fillG = 0; }
        }
        else {
            fillR = fillR + increment;
            if (fillR > 255) { fillR = 255; }
        }
    }
    
    return "rgba(" + fillR + "," + fillG + "," + fillB + ", 0.1)";
}





	// me.tutorial = function() {
	// 	/// document.getElementById('tutorial').parentNode(removeChild());
	// 	/// ^ or fade out the tutorial question mark until it's closed

	// 	///:
	// 	var ptut = document.getElementsByClassName('invite tutorial');
	// 	ptut = ptut.length ? ptut = ptut[0] : false;
	// 	if(ptut) {
	// 		document.body.className = null;
	// 		me.spectrum(false);
	// 		Anm.fadeOut(ptut, 80);
	// 	}

	// 	var t_step = 0;
	// 	var t_texts = ["Welcome to Telephenesis! I am a sarcastic tutorial and I was creatively named.",
	// 		"I'll help you understand what's going on here. I'm very excited.",
	// 		"To navigate, click and drag the universe around.",
	// 		"Every star in this galaxy resembles a piece of music. Click one to play and pause it.",
	// 		"You're so good at this. In Telephenesis, a musician picks a star and recreates it. The line between two stars symbolizes this connection.",
	// 		"Use the arrow keys to go forwards and backwards between stars and their recreations. Seriously... do that now.",
	// 		//"Now ye' gettin' it, kid! You're the greatest! Let's right click this star and look at all the wonderful things we can do.",
	// 		"You've displayed much skill, today. But now we must part. I'll always remember our time together... friend."]

	// 	var tutorial = document.createElement('div');
	// 	tutorial.className = 'tutorial large';
	// 	tutorial.style.top = '40%';
	// 	var text = document.createElement('div');
	// 	text.innerHTML = t_texts[0];
	// 	tutorial.appendChild(text);
	// 	var meta = document.createElement('div');
	// 	meta.className = 'meta';
	// 	var prev = document.createElement('a');
	// 	prev.className = 'prev btn o';
	// 	prev.innerHTML = 'previous';
	// 	prev.style.display = 'none';
	// 	prev.onclick = function() { step(-1) };
	// 	meta.appendChild(prev);
	// 	var next = document.createElement('a');
	// 	next.className= 'next btn g';
	// 	next.innerHTML = 'next';
	// 	next.onclick = function() { step(1) };
	// 	meta.appendChild(next);
	// 	var close = document.createElement('a');
	// 	close.className = 'close btn r';
	// 	close.innerHTML = 'close';
	// 	close.onclick = function() {
	// 		tutorial.parentNode.removeChild(tutorial);

	// 		///:
	// 		if(!ptut) {
	// 			spc.ctr(0, 0);
	// 			spc.flt(false);
	// 			Anm.fadeIn(spc.map);
	// 		}
	// 		if(ptut) {
	// 			document.body.className = 'inverse';
	// 			telep.spectrum(true);
	// 			Anm.fadeIn(ptut);
	// 			spc.flt(true);
	// 			Anm.fadeOut(spc.map);
	// 		}
	// 	}
	// 	meta.appendChild(close);
	// 	tutorial.appendChild(meta);

	// 	Anm.fadeOut(spc.map);
	// 	spc.flt(true);

	// 	function step(s) {
	// 		t_step += s;

	// 		Anm.fadeOut(tutorial, 150, function() {
	// 			text.innerHTML = t_texts[t_step];

	// 			if(t_step < 2) document.body.appendChild(tutorial);
	// 			else spc.map.appendChild(tutorial);

	// 			switch(t_step) {
	// 				case 0:
	// 					prev.style.display = 'none';
	// 					next.style.display = null;
	// 					tutorial.style.left = '30%';
	// 					tutorial.style.top = '40%';
	// 					break;
	// 				case 1:
	// 					prev.style.display = null;
	// 					next.style.display = null;
	// 					tutorial.style.left = '30%';
	// 					tutorial.style.top = '40%';
	// 					break;

	// 				case 2:
	// 					meta.style.display = 'none';
	// 					prev.style.display = null;
	// 					next.style.display = null;

	// 					spc.flt(false);
	// 					spc.ctr(0, 0);

	// 					Anm.fadeIn(spc.map);

	// 					/// arguments.callee?
	// 					cor.al(spc.e, 'mousedown', function() {
	// 						cor.al(spc.e, 'mousemove', function() {
	// 							text.innerHTML += "  That's fresh.";
	// 							Anm.fadeIn(meta);

	// 							cor.rl(spc.e, 'mousemove', arguments.callee);
	// 						});

	// 						cor.rl(spc.e, 'mousedown', arguments.callee);
	// 					});

	// 					tutorial.style.left = 0 - window.innerWidth/2 + 150 + "px";
	// 					tutorial.style.top = 0 - window.innerHeight/2 + 150 + "px";

	// 					break;

	// 				case 3:
	// 					meta.style.display = 'none';

	// 					cor.al(spc.e, 'click', function(e) {
	// 						console.log(e.target.parentNode);
	// 						if(e.target.parentNode.className.indexOf('star') === -1) return false;
	// 						step(1);
	// 						cor.rl(spc.e, 'click', arguments.callee);
	// 					});

	// 					spc.ctr(0,0);
	// 					tutorial.style.left = '-200px';
	// 					tutorial.style.top = '50px';

	// 					break;

	// 				case 4:
	// 					meta.style.display = null;
	// 					//next.style.display = null;

	// 					var xo = playing_star.offsetLeft;
	// 					var yo = playing_star.offsetTop;
	// 					tutorial.style.left = xo+150+'px';
	// 					tutorial.style.top = yo-50+'px';
	// 					spc.ctr(xo+200, yo);
	// 					break;

	// 				case 5:
	// 					meta.style.display = 'none';

	// 					cor.al(window, 'keydown', function(e) {
	// 						if(e.keyCode == 39 || e.keyCode == 37) {
	// 							step(1);
	// 							cor.rl(window, 'keydown', arguments.callee);
	// 						}
	// 					});

	// 					break;

	// 				case 6:
	// 					meta.style.display = null;
	// 					next.style.display = 'none';

	// 					var xo = playing_star.offsetLeft;
	// 					var yo = playing_star.offsetTop;
	// 					tutorial.style.left = xo+150+'px';
	// 					tutorial.style.top = yo-50+'px';
	// 					spc.ctr(xo+200, yo);
	// 					var stars = document.getElementsByClassName('star');
	// 					for(var i=0, j=stars.length; i<j; i++) {
	// 						cor.al(stars[i].children[0], 'contextmenu', function() {
	// 							step(1);
	// 							for(var i=0, j=stars.length; i<j; i++) {
	// 								cor.rl(stars[i].children[0], 'contextmenu', arguments.callee);
	// 							}
	// 						});
	// 					}

	// 					break;

	// 				case 7:
	// 					var xo = playing_star.offsetLeft;
	// 					var yo = playing_star.offsetTop;
	// 					tutorial.style.left = xo-500+'px';
	// 					tutorial.style.top = yo-50+'px';
	// 					spc.ctr(xo-200, yo);
	// 			}

	// 			Anm.fadeIn(tutorial);
	// 		});
	// 	}

	// 	document.body.appendChild(tutorial);
	// }



	// me.populate = function(stars) {
	// 	for(var i=0, j=stars.length; i<j; i++) {
	// 		var s = stars[i];

	// 		var star = document.createElement('div');
	// 		star.className = 'star';
	// 		star.style.left = s.x+"px";
	// 		star.style.top = s.y+"px";

	// 		var a = document.createElement('a');
	// 		a.id = 's'+s.id;
	// 		a.href = "/f/"+s.id+".mp3";
	// 		star.appendChild(a);
	// 		a.onclick = load;

	// 		var sartist = document.createElement('span');
	// 		sartist.className = 'sartist';
	// 		sartist.innerHTML = s.creator;
	// 		star.appendChild(sartist);

	// 		var stime = document.createElement('span');
	// 		stime.className = 'stime';
	// 		star.appendChild(stime);

	// 		var line = document.createElement('img');
	// 		var lw = s.x - s.lx;
	// 		var lh = s.y - s.ly;

	// 		spc.map.appendChild(star);
	// 	}
	// }



