///TODO convert to ES6 class

import cor from '../libs/minlab/cor';
import ajx from '../libs/minlab/ajx';
import HistoryTime from '../libs/history-time';

import clientState from './ClientState';
import Stars from './Stars';

function Interface(Telep) {
	this.init = function() {
		var menuToggleElement = document.getElementsByClassName('menuToggle')[0]; ////

		// var closes = document.getElementsByClassName('close');
		// if(closes.length) for(var i=0, j=closes.length; i<j; i++) {
		// 	cor.al(closes[i], 'click', function(event) {
		// 		event.preventDefault();
		// 		navigate('/');
		// 	});
		// }

		/* shortcuts */
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

					////:
					if(Stars.view == 'galaxy') {
						Stars.sort('newest', 'list');
					} else {
						Stars.sort(null, 'galaxy');
					}
				} break;
			}
		});

		/* navigation */
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
