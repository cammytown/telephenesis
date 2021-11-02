///TODO convert to ES6 class

import cor from '../libs/minlab/cor';
// import ajx from '../libs/minlab/ajx';
import spc from '../libs/minlab/spc';
// import HistoryTime from '../libs/history-time';
import Navigation from './Navigation';

import clientState from './ClientState';
import mediaPlayer from './MediaPlayer';
import Stars from './Stars';
import CONSTS from '../../../abstract/constants.js';
import locale from '../../../locale/en_us.json'; ///REVISIT

/**
 * Telephenesis class for user interface methods.
 * @constructor
 **/
function Interface() {
	// var currentOrderLink;
	var me = this;

	me.order = CONSTS.ORDER.GALAXY;
	me.view = CONSTS.VIEW.GALAXY;

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

					if(Interface.view != CONSTS.VIEW.GALAXY) { ///REVISIT this should probably just happen as a consequence of navigating to /
						me.sort(CONSTS.VIEW.GALAXY);
					}
				} break;
			}
		});

		/* SORTING */
		for(var sortLinks of cor._('.sort')) {
			cor.al(sortLinks, 'click', onSortClick);
		}
	}

	/**
	 * Called when all components have loaded.
	 * @see ClientState#addComponent
	 **/
	this.ready = function() {
		///TODO revisit implementation; probably render on the server:
		// If loaded URL contains a query string:
		if(location.search.length) {
			// Check for view and/or order in query string:
			var params = new URLSearchParams(location.search);
			var initialOrder = params.get('order');
			var initialView = params.get('view');

			// If there's a view or order in the query string:
			if(initialOrder || initialView) {
				// Display the view and/or order:
				me.sort(initialOrder, initialView);
			}
		}
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
	 * @param {string} errorCode - The error code from {@link CONSTANTS.ERROR} to display a message for.
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
		me.sort(
			event.currentTarget.getAttribute('data-order'),
			event.currentTarget.getAttribute('data-view'),
			event.currentTarget
		);
	}

	/**
	 * Sort the stars in the interface and display them in {@link view}.
	 * @param {CONSTANTS.ORDER} order - The nature of the ordering of the stars.
	 * @param {CONSTANTS.VIEW} view - The view by which to show the stars.
	 * @param {Element} [clickedEle = false] - The sort link that was clicked to run this method.
	 **/
	this.sort = function(order, view, clickedEle = false) {
		///REVISIT not into all this .toLowerCase() business... better design?

		if(order) {
			// If there's an order already, remove its class from document.body:
			if(me.order) {
				cor.rc(document.body, me.order.toLowerCase() + '-order'); ////
			}

			// Add the new order's class to document.body:
			cor.ac(document.body, order.toLowerCase() + '-order'); ////

			// If the order is GALAXY, so is the view:
			if(order == CONSTS.ORDER.GALAXY) {
				view = CONSTS.VIEW.GALAXY; ///REVISIT this solution; not sure it's best architecture

			// If view is not GALAXY:
			} else {
				// If no view was provided to sort():
				if(!view) {
					// If we're already in a non-galaxy view (i.e. list/grid):
					if(me.view != CONSTS.VIEW.GALAXY) {
						// Do nothing; keep current view.

					// If we're in galaxy view, default to 'list' so that new order can be shown:
					} else {
						// There's no current table view; default to list:
						view = CONSTS.VIEW.LIST;
					}
				}
			}


			me.order = order.toUpperCase();
		}

		// If a view was supplied to sort() and it is different from the current one:
		if(view && view != me.view) {
			// If there's already a view, remove its class from document.body:
			if(me.view) {
				cor.rc(document.body, me.view.toLowerCase() + '-view'); ////
			}

			// Add the new view's class to document.body:
			cor.ac(document.body, view.toLowerCase() + '-view'); ////


			me.view = view.toUpperCase();
		}

		///TODO only do this stuff if the value has changed:

		// Update labels that display the current order:
		for(var orderLabelEle of document.getElementsByClassName('current-order')) {
			orderLabelEle.innerText = locale[me.order].toLowerCase();
		}

		// Update any labels that display the current view:
		for(var viewLabelEle of document.getElementsByClassName('current-view')) {
			viewLabelEle.innerText = locale[me.view].toLowerCase();
		}

		// Update the header of the view (to reflect the order):
		for(var viewHeaderEle of document.getElementsByClassName('view-header')) {
			viewHeaderEle.innerText = locale['SORT-BY-' + me.order];
		}

		// Actually sort and position the stars:
		Stars.sort(me.order, me.view);

		// Update the URI:
		var newURI = "/";
		if(me.view != CONSTS.VIEW.GALAXY) {
			newURI += '?view=' + me.view.toLowerCase()
				+ '&order=' + me.order.toLowerCase();
		}

		Navigation.navigate(newURI);
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
