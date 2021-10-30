///TODO convert to ES6 class

import cor from '../libs/minlab/cor';
// import ajx from '../libs/minlab/ajx';
import spc from '../libs/minlab/spc';
// import HistoryTime from '../libs/history-time';
import navigation from './Navigation';

import clientState from './ClientState';
import mediaPlayer from './MediaPlayer';
import Stars from './Stars';

/**
 * Telephenesis class for user interface methods.
 * @constructor
 **/
function Interface() {
	// var currentOrderLink;
	var me = this;

	me.order = "galaxy";
	me.view = "galaxy";

	/** Element which holds messages shown to user. **/
	var messageElement;

	this.init = function() {
		messageElement = document.getElementById('notification');


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
					navigation.navigate('/'); //// page title

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

	/**
	 * Displays a message to the user.
	 * @param {string} message - The message to display.
	 * @param {string} [type="notification"] - The type of message.
	 * @param {number} [duration=5000] - How long to display the message for.
	 */
	this.displayMessage = function(message, type = "notification", duration = 5000) { ///REVISIT naming
		messageElement.innerText = message;
		messageElement.className = type;
		document.body.appendChild(messageElement);
		///TODO fade out
		window.setTimeout(() => limbo.appendChild(messageElement), duration);
	}

	/**
	 * Displays an error to the user.
	 * @param {string} errorCode - The error code from {@link Constants.ERROR to display.
	 */
	this.displayError = function(errorCode) {
		var errorMessages = { ///TODO probably to be moved when we start localization work
			NO_CREATION_TICKETS: "Sorry, you have no creation tickets left. Please wait a while!",
			NO_RECREATION_TICKETS: "Sorry, you have no recreation tickets left. Please wait a while!",
		};

		var errorMessage;

		if(errorMessages.hasOwnProperty(errorCode)) {
			errorMessage = errorMessages[errorCode];
		} else {
			errorMessage = "Sorry, something went wrong. Please try again.";
		}

		me.displayMessage(errorMessage, "error");
	}

	function onSortClick(event) {
		sort(
			event.currentTarget.getAttribute('data-order'),
			event.currentTarget.getAttribute('data-view'),
			event.currentTarget
		);
	}

	function sort(order, view, clickedEle = false) {
		///TODO probably move some of this into Interface.js:
		if(order) {
			if(me.order) {
				cor.rc(document.body, me.order + '-order'); ////
			}

			cor.ac(document.body, order + '-order'); ////

			if(order == 'galaxy') {
				view = 'galaxy'; ///REVISIT this solution; not sure it's best architecture
			} else {
				// If view is not galaxy:

				if(!view) {
					if(me.view != 'galaxy') {
						// Keep current view.
					} else {
						// There's no current table view; default to list:
						view = 'list';
					}
				}
			}

			if(clickedEle.getAttribute('data-order')) {
				for(var orderLabelEle of document.getElementsByClassName('current-order')) {
					///REVISIT should we prefer just a data-menu-label attribute or something instead?:
					orderLabelEle.innerText = clickedEle.innerText;
					// orderLabelEle.innerText = clickedEle.getAttribute('data-order').replace('-', ' ');
				}
			}

			me.order = order;
		}

		if(view && view != me.view) {
			if(me.view) {
				cor.rc(document.body, me.view + '-view'); ////
			}

			cor.ac(document.body, view + '-view'); ////

			for(var viewLabelEle of document.getElementsByClassName('current-view')) {
				viewLabelEle.innerText = view;
				// viewLabelEle.innerText = clickedEle.getAttribute('data-view').replace('-', ' ');
			}

			me.view = view;
		}

		if(clickedEle.getAttribute('data-header')) {
			for(var viewHeaderEle of document.getElementsByClassName('view-header')) {
				viewHeaderEle.innerText = clickedEle.getAttribute('data-header');
			}
		}

		console.log([me.order, me.view]);

		Stars.sort(me.order, me.view);
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
