///TODO convert to ES6 class

import cor from '../libs/minlab/cor';
// import ajx from '../libs/minlab/ajx';
import spc from '../libs/minlab/spc';
// import HistoryTime from '../libs/history-time';
import Navigation from './Navigation';

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

	/**
	 * The ID of the setTimeout timer being used to display 
	 * the current message.
	 * @type {number}
	 **/
	var messageTimerID = null;

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
					Navigation.navigate('/'); //// page title

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
		if(messageTimerID !== null) {
			clearTimeout(messageTimerID);
			messageTimerID = null;
		}

		messageElement.innerText = message;
		messageElement.className = type;
		document.body.appendChild(messageElement);
		///TODO fade out
		messageTimerID = setTimeout(() => limbo.appendChild(messageElement), duration);
	}

	/**
	 * Displays an error to the user.
	 * @param {string} errorCode - The error code from {@link Constants.ERROR} to display a message for.
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
			// If there's an order already, remove its class from document.body:
			if(me.order) {
				cor.rc(document.body, me.order + '-order'); ////
			}

			// Add the new order's class to document.body:
			cor.ac(document.body, order + '-order'); ////

			// If the order is 'galaxy', so is the view:
			if(order == 'galaxy') {
				view = 'galaxy'; ///REVISIT this solution; not sure it's best architecture

			// If view is not galaxy:
			} else {
				// If no view was provided to sort():
				if(!view) {
					// If we're already in a non-galaxy view (i.e. list/grid):
					if(me.view != 'galaxy') {
						// Do nothing; keep current view.

					// If we're in galaxy view, default to 'list' so that new order can be shown:
					} else {
						// There's no current table view; default to list:
						view = 'list';
					}
				}
			}

			// If the order link we clicked specifies the order, update the UI:
			if(clickedEle.getAttribute('data-order')) {
				for(var orderLabelEle of document.getElementsByClassName('current-order')) {
					///REVISIT should we prefer just a data-menu-label attribute or something instead?:
					orderLabelEle.innerText = clickedEle.innerText;
					// orderLabelEle.innerText = clickedEle.getAttribute('data-order').replace('-', ' ');
				}
			}

			me.order = order;
		}

		// If a view was supplied to sort() and it is different from the current one:
		if(view && view != me.view) {
			// If there's already a view, remove its class from document.body:
			if(me.view) {
				cor.rc(document.body, me.view + '-view'); ////
			}

			// Add the new view's class to document.body:
			cor.ac(document.body, view + '-view'); ////

			// Update any labels that display the current view:
			for(var viewLabelEle of document.getElementsByClassName('current-view')) {
				viewLabelEle.innerText = view;
				// viewLabelEle.innerText = clickedEle.getAttribute('data-view').replace('-', ' ');
			}

			me.view = view;
		}

		// If the sort link we clicked specifies header text:
		if(clickedEle.getAttribute('data-header')) {
			for(var viewHeaderEle of document.getElementsByClassName('view-header')) {
				viewHeaderEle.innerText = clickedEle.getAttribute('data-header');
			}
		}

		// Actually sort and position the stars:
		Stars.sort(me.order, me.view);

		// Update the URI:
		Navigation.navigate('/?view=' + me.view + '&order=' + me.order);
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
