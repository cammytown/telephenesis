///TODO convert to ES6 class

import cor from './libs/minlab/cor';
import spc from './libs/minlab/spc'; /// relying on implied singleton
import Anm from './libs/minlab/anm';
import ajx from './libs/minlab/ajx';
import HistoryTime from './libs/history-time'
import clientState from './ClientState';

var canvasContext;
var menuToggleElement;

var starMenu;
var galaxyMenu;

// initializeInput(); /// probably just work into init()

var uiCanvas;
var queuedConstellationLines = [];

// var playingStar = false;
// var actingStar;
var activeContextBox = false;

HistoryTime.bindPathToCallback('*', navigate);

function init(Telep) {
	starMenu = document.getElementById('starMenu');
	galaxyMenu = document.getElementById('galaxyMenu');

	menuToggleElement = document.getElementsByClassName('menuToggle')[0]; ////
	uiCanvas = document.getElementById('uiEffects');

	uiCanvas.width = document.body.offsetWidth;
	uiCanvas.height = document.body.offsetHeight;
	canvasContext = uiCanvas.getContext('2d');

	window.addEventListener('resize', function() {
		uiCanvas.width = document.body.offsetWidth;
		uiCanvas.height = document.body.offsetHeight;
	});

	generateConstellationLines();

	// var closes = document.getElementsByClassName('close');
	// if(closes.length) for(var i=0, j=closes.length; i<j; i++) {
	// 	cor.al(closes[i], 'click', function(event) {
	// 		event.preventDefault();
	// 		navigate('/');
	// 	});
	// }

	var starElements = document.getElementsByClassName('star');
	for (var starIndex = 0; starIndex < starElements.length; starIndex++) {
		var starElement = starElements[starIndex];
		starElement.addEventListener('click', onStarClick);
	}

	var navLinks = document.getElementsByClassName('nav'); ///REVISIT not really into this class name; something more descriptive?
	for (var navLinkIndex = 0; navLinkIndex < navLinks.length; navLinkIndex++) {
		navLinks[navLinkIndex].addEventListener('click', onNavLinkClick);
	}

	// var aElements = document.getElementsByTagName('a');
	// for(var i=0, j=aElements.length; i<j; i++) {
	// 	aElements[i].addEventListener('click', onLinkClick);
	// }

	// var aElements = document.getElementsByTagName('a');
	// for(var i=0, j=aElements.length; i<j; i++) {
	// 	aElements[i].addEventListener('click', onLinkClick);
	// }

	/* forms */
	//// not a good solution:
	var forms = document.getElementsByTagName('form');
	for(var i=0, j=forms.length; i<j; i++) {
		if(cor.cc(forms[i], 'ajax')) {
			cor.al(forms[i], 'submit', onFormSubmit);
		}
	}

	/* shortcuts */
	cor.al(window, 'keydown', function(e) {
		switch(e.keyCode) {
			case 39: // right arrow
				e.preventDefault();
				if(clientState.playingStar) {
					var nsid = clientState.playingStar.getAttribute('data-next');
					/// if next star isn't loaded? if there is no next star?
					var nstar = document.getElementById('s'+nsid);
					playStar(nstar);
				}
				break;

			case 37: // left arrow
				e.preventDefault();
				if(clientState.playingStar) {
					var previousStarID = clientState.playingStar.getAttribute('data-prev');
					/// if prev star isn't loaded?
					var previousStar = document.getElementById('s'+previousStarID);
					playStar(previousStar);
				}
				break;

			case 32: { // spacebar
				if(!activeContextBox) {
					e.preventDefault();

					clientState.audio.element.paused ? clientState.audio.play() : clientState.audio.pause();
				}
			} break;

			case 27: { // escape key
				// state.updating = true;
				HistoryTime.navigateTo('/', "Telephenesis"); //// page title
			} break;
		}
	});

	/* navigation */
	cor.al(spc.element, 'click', function(event) {
		closeContextMenu();

		if(event.target.parentNode.id == 'spc' && HistoryTime.state.path != '/') { ///
			// state.updating = true;
			HistoryTime.navigate('/', "Telephenesis"); //// page title
		}
	});

	cor.al(spc.element, 'contextmenu', contextMenu);

	cor.al(menuToggleElement, 'click', toggleMenu);

	/// TODO: put toggle and menu in same element for active?
	function toggleMenu(e) {
		var menu = document.getElementById('menu');
		var isActive = cor.cc(menu, 'active');
		if(isActive) {
			e.target.innerHTML = '|||';
			cor.rc(e.target, 'active');
			cor.rc(menu, 'active');
		} else {
			e.target.innerHTML = '&rarr;';
			cor.ac(e.target, 'active');
			cor.ac(menu, 'active');
		}
	}
}

function contextMenu(e) {
	e.preventDefault();
	e.stopPropagation();

	closeContextMenu();

	var isStarClick = cor.cc(e.target.parentNode, 'star'); ///REVISIT weird architecture?
	if(isStarClick) {
		var star = e.target.parentNode;
		var sid = star.id.split('s')[1];

		//document.getElementById('download').href = '/f/'+sid+'.mp3';
		clientState.actingStar = star;


		var menu = starMenu;
		menu.style.left = parseInt(star.style.left) + 12 + 'px';
		menu.style.top = parseInt(star.style.top) - 5 + 'px';

		menu.children[1].href = sid+'/recreate';

		spc.map.appendChild(menu);
	} else {
		closeContextMenu();
		clientState.actingStar = false;

		var menu = galaxyMenu;
		menu.style.left = e.clientX + 'px';
		menu.style.top = e.clientY + 'px';
		document.body.appendChild(menu);
	}
}

var lineDrawStartMS = performance.now();
function generateConstellationLines() {
	/* stars */
	var starElements = document.getElementsByClassName('star');
	for (var starIndex = 0; starIndex < starElements.length; starIndex++) {
		var starElement = starElements[starIndex];
		if(starElement.getAttribute('data-prev')) {
			var originStarID = starElement.getAttribute('data-prev');
			if(parseInt(originStarID) > 0) {
				var rootStar = document.getElementById('s' + originStarID);
				rootStar.setAttribute('data-next', starElement.id.split('s')[1]);
				queuedConstellationLines.push({
					startX: parseInt(rootStar.style.left),
					startY: parseInt(rootStar.style.top),
					startColor: rootStar.getElementsByTagName('a')[0].style.backgroundColor, ///
					endX: parseInt(starElement.style.left),
					endY: parseInt(starElement.style.top),
					endColor: starElement.getElementsByTagName('a')[0].style.backgroundColor, ///
					tier: parseInt(starElement.getAttribute('data-tier'))
				});
			}
		}
	}

	window.requestAnimationFrame(drawLineStep);

	function drawLineStep(currentMS) {
		canvasContext.clearRect(0, 0, uiCanvas.width, uiCanvas.height);

		var elapsedMS = currentMS - lineDrawStartMS;
		for (var lineIndex = 0; lineIndex < queuedConstellationLines.length; lineIndex++) {
			var line = queuedConstellationLines[lineIndex];

			////
			// var delay = (line.tier * 1000) - (line.tier * 350);
			var delay = ((line.tier) * 1000) - (line.tier * 800);
			// var delay = (line.tier * 1000) / (line.tier / 2);
			// var delay = ((line.tier * line.tier / 2) * 1000) - (line.tier * line.tier * 475);

			var progress = (elapsedMS - delay) / 1000;
			if(progress < 0) {
				continue;
			}

			if(progress >= 1) {
				progress = 1;
				// queuedConstellationLines.splice(queuedConstellationLines.indexOf(line), 1);
			}

			var lineVector = new spc.Vec2(line.endX - line.startX, line.endY - line.startY)
				// .normalize()
				.scale(progress);

			// console.log(lineVector);


			var drawVec = new spc.Vec2(line.startX + lineVector.x, line.startY + lineVector.y);

			// var lineGradient = canvasContext.createLinearGradient(0,0,170,0);
			// var lineGradient = canvasContext.createLinearGradient(line.startX,line.startY,line.endX,line.endY);
			// var lineGradient = canvasContext.createLinearGradient(0, 0, line.endX + line.startX, line.endY + line.startY);
			var lineGradient = canvasContext.createLinearGradient(line.startX + spc.x, line.startY + spc.y, drawVec.x + spc.x, drawVec.y + spc.y);
			lineGradient.addColorStop("0", line.startColor);
			lineGradient.addColorStop("1.0", line.endColor);

			// canvasContext.strokeStyle = 'rgb(200, 200, 200)';
			canvasContext.strokeStyle = lineGradient;
			canvasContext.beginPath();
			canvasContext.moveTo(line.startX + spc.x, line.startY + spc.y);
			canvasContext.lineTo(drawVec.x + spc.x, drawVec.y + spc.y);
			canvasContext.stroke();
		}

		/// optimize
		// if(queuedConstellationLines.length) {
			window.requestAnimationFrame(drawLineStep); ////
		// }
	}
}

// VISUAL FUNCTIONS
function closeContextMenu() {
	// var menus = document.getElementsByClassName('star menu');
	// if(menus.length) menus[0].className = 'star';
	limbo.appendChild(starMenu);
	limbo.appendChild(galaxyMenu);
}

function onNavLinkClick(event) {
	event.preventDefault();

	var path = event.target.pathname;
	// state.updating = true;

	HistoryTime.navigateTo(path, "Telephenesis"); ///// make page titles

	// if(cor.cc(this.parentNode, 'star')) {
	// 	navigate(path);
	// } else {
	// 	if(state.path == path) navigate('/');
	// 	else navigate(path);
	// }
}

function onStarClick(event) {
	event.preventDefault();
	playStar(event.currentTarget);
	// if(state.path == path) return true;
}

function navigate(path) {
	var parts = path.split('/');
	var operation = parts[1];

	// if(operation.length && !isNaN(operation)) {
	// 	var star = document.getElementById('s'+operation)
	// 	playStar(star);
	// 	// if(state.path == path) return true;

	// } else switch(operation) {
	switch(operation) {
		/// TODO: refactor:
		case 'login':
		case 'register':
		case 'settings':
		case 'invite':
		case 'create':
		case 'recreate':
		case 'renameStar':
		case 'deleteStar':
		case 'help':
		{
			closeContextMenu(); ///
			close();
			open(operation);
		} break;

		// case '': {

		// } break;

		case 'bookmark': {
			bookmarkStar(clientState.actingStar);
			return true;
		} break;

		case 'moveStar': {
			initializeMove();
			return true;
		} break;

		case 'recolorStar': {
			initializeRecolor();
			return true;
		} break;

		case 'logout': {
			close();
			logout();
			return true;
		} break;

		default: {
			///TODO some kind of 404?
			close();

			// spc.flt(false);
			// spc.s = 'active';
		}
	}

	// if(state.updating) {
	// 	state.path = path;
	// 	history.pushState(state, 'telephenesis : ' + operation, path);
	// }

	function open(box) {
		var box = document.getElementById(box);
		activeContextBox = box;
		document.body.appendChild(box);
		Anm.fadeIn(box);
		// spc.flt(true);
	}

	///:
	function close(box) {
		box = (typeof box === "undefined") ? activeContextBox : box;
		activeContextBox = false;

		///:
		// menuToggleElement.innerHTML = '|||';
		// cor.rc(menuToggleElement, 'active');
		// cor.rc(document.getElementById('menu'), 'active');

		if(box) {
			Anm.fadeOut(box, 250, function() {
				limbo.appendChild(box);
			});
		}

		// spc.flt(false);
	}
}

function deleteStar(star) { /// revisit architecture
	var sid = clientState.actingStar.id.split('s')[1];
	var p = "sid="+sid;
	ajx('/ajax/deleteStar', p, function(d) {
		var r = JSON.parse(d);
		if(!r.error) {
			clientState.actingStar.fadeOut();
		}
	});

	return false;
}

function bookmarkStar(star) {
	var sid = star.id.split('s')[1];
	var p = "sid="+sid;
	ajx('/ajax/bookmark', p, function(d) {
		var r = JSON.parse(d);
		if(!r.error) {
			cor.ac(star, 'bookmarked');
			limbo.appendChild(starMenu);
		}
	});

	return false;
}

function playStar(star) {
	// var sid = star.id.split('s')[1];
	// var sid = star.getAttribute('data-id').split('s')[1];

	// var infoBox = cor._('#starInfoBox');
	// infoBox.get

	var starTitle = star.getAttribute('data-title');
	cor._('#playingStarTitle').innerHTML = starTitle;

	var creatorName = star.getAttribute('data-creatorName');
	cor._('#playingCreatorName').innerHTML = creatorName;

	var creatorLink = star.getAttribute('data-creatorLink');
	cor._('#playingCreatorLink').innerHTML = creatorLink;

	// cor._('#playingStarInfo').style.display = 'block';
	cor.ac(document.body, 'playing')

	if(star == clientState.playingStar) {
		clientState.audio.element.paused ? clientState.audio.play() : clientState.audio.pause();
	} else {
		if(clientState.playingStar) {
			cor.rc(clientState.playingStar, "active");
		}

		clientState.playingStar = star;
		cor.ac(star, "active");

		// var time = star.getElementsByTagName('span')[1];

		clientState.audio.load(star.getElementsByTagName('a')[0].href);
		// clientState.audio.load('/music/'+sid+'.mp3');

		clientState.audio.element.addEventListener('loadedmetadata', function() {
			clientState.audio.play();
		}, {
			once: true /// browser support?
		});
	}
}

// me.invite = function(event) {
// 	/// can't load if not logged in
// 	/// create separate aud for sound-effects like this

// 	clientState.audio.load('/audio/ticket.mp3');

// 	var ticket = document.getElementById('ticket');
// 	document.body.appendChild(ticket, limbo);
// 	Anm.fadeIn(ticket, 2750); ///
// 	// spc.flt(true);

// 	event.preventDefault();
// }


function onFormSubmit(event) { //// temporary; should find more robust solution probably // converts all form elements to ajax
	event.preventDefault();

	/// quick-fix; if working on a star, update the field values appropriately; this should obviously happen somewhere else
	if(clientState.actingStar) {
		var activeStarIdInputs = document.getElementsByClassName('activeStarIdInput');
		for (var inputIndex = 0; inputIndex < activeStarIdInputs.length; inputIndex++) {
			var input = activeStarIdInputs[inputIndex];
			input.value = clientState.actingStar.id.split('s')[1];
		}
	}

	var form = event.target;
	var children = form.children;
	var op = form.id; ///REVISIT weird solution?

	var p = "";
	for(var i=0, j=children.length-1; i<j; i++) { //// requires that the children be direct descendents of <form>
		if(i) p += "&";
		p += children[i].name + "=" + children[i].value;
	}

	ajx('/ajax/'+op, p, function(d) {
		var r = JSON.parse(d);
		console.log("eh?")
		if(r.error) {
			console.log("eh2?")
			console.log(r.error);
			throw new Error(r.error);
		} else {
			///
			// HistoryTime.goBack()
			history.back(); ////
			console.log("Success?");
			// window.history.go(-1);
			// navigate('/'); /// previous screen

			///
			// if(state.path.split('/')[1] == 'invite') {
			// 	window.reload();
			// }

			if(op == 'register' || op == 'login') {
				cor.ac(document.body, 'in');
			}

			if(op == 'login' && r.lv) {
				cor.ac(document.body, 'creator');
			}
		}
	});
}

function logout() { /// placement
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

export default { init }

