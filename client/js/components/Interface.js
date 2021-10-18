///TODO convert to ES6 class

import cor from '../libs/minlab/cor';
// import ajx from '../libs/minlab/ajx';
import spc from '../libs/minlab/spc';
import HistoryTime from '../libs/history-time';

import clientState from './ClientState';
import Stars from './Stars';

function Interface(Telep) {
	// var currentOrderLink;

	this.init = function() {

		// var closes = document.getElementsByClassName('close');
		// if(closes.length) for(var i=0, j=closes.length; i<j; i++) {
		// 	cor.al(closes[i], 'click', function(event) {
		// 		event.preventDefault();
		// 		navigate('/');
		// 	});
		// }

		spc.moveCallbacks.push(Stars.drawLineStep);

		/* NAVIGATION */
		var menuToggleElement = document.getElementsByClassName('menuToggle')[0]; ////
		// currentOrderLink = document.getElementsByClassName('sort active')[0]; ///REVISIT naming/architecture

		// Open header menu when button is clicked
		cor.al(menuToggleElement, 'click', toggleMenu);
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

		/* SHORTCUTS */
		cor.al(window, 'keydown', function(e) {
			switch(e.keyCode) {
				case 39: { // right arrow
					e.preventDefault();
					if(clientState.playingStar) {
						var nsid = clientState.playingStar.getAttribute('data-next');
						/// if next star isn't loaded? if there is no next star?
						var nstar = document.getElementById('s'+nsid);
						playStar(nstar);
					}
				} break;

				case 37: { // left arrow
					e.preventDefault();
					if(clientState.playingStar) {
						var previousStarID = clientState.playingStar.getAttribute('data-prev');
						/// if prev star isn't loaded?
						var previousStar = document.getElementById('s'+previousStarID);
						playStar(previousStar);
					}
				} break;

				case 32: { // spacebar
					if(!clientState.activeWindow) {
						e.preventDefault();

						mediaPlayer.audio.element.paused ? mediaPlayer.audio.play() : mediaPlayer.audio.pause();
					}
				} break;

				case 27: { // escape key
					// state.updating = true;
					HistoryTime.navigateTo('/', "Telephenesis"); //// page title

					if(Stars.view != "galaxy") { ///REVISIT this should probably just happen as a consequence of navigating to /
						Stars.sort(null, "galaxy");
					}
				} break;
			}
		});

		/* SORTING */
		for(var sortRecentLinks of cor._('.sort')) {
			cor.al(sortRecentLinks, 'click', onSortClick);
		}

		// for(var sortRecentLinks of cor._('.sort-most-recent')) {
		// 	cor.al(sortRecentLinks, 'click', () => sort('most-recent'));
		// }

		// for(var sortRecentLinks of cor._('.sort-galaxy')) {
		// 	cor.al(sortRecentLinks, 'click', () => sort(null, 'galaxy'));
		// }

	}

	function onSortClick(event) {
		var orderLink = event.currentTarget;

		for(var viewLabelEle of document.getElementsByClassName('current-view')) {
			viewLabelEle.innerText = orderLink.innerText;
		}

		for(var viewHeaderEle of document.getElementsByClassName('view-header')) {
			viewHeaderEle.innerText = orderLink.getAttribute('data-header');
		}

		sort(orderLink.getAttribute('data-order'), orderLink.getAttribute('data-view'));
	}

	function sort(order, view = 'list') {

		Stars.sort(order, view);
	}

	// me.invite = function(event) {
	// 	/// can't load if not logged in
	// 	/// create separate aud for sound-effects like this

	// 	mediaPlayer.load('/audio/ticket.mp3');

	// 	var ticket = document.getElementById('ticket');
	// 	document.body.appendChild(ticket, limbo);
	// 	Anm.fadeIn(ticket, 2750); ///
	// 	// spc.flt(true);

	// 	event.preventDefault();
	// }
}

export default new Interface();
