///TODO convert to ES6 class

import COR from '../libs/minlab/cor';
// import ajx from '../libs/minlab/ajx';
import spc from '../libs/minlab/spc';
import HistoryTime from '../libs/history-time';

import CONSTS from '../../../abstract/constants.js';
import locale from '../../../locale/en_us.json'; ///REVISIT
import Vector from '../../../abstract/Vector';

import navigation from './Navigation';

import clientState from './ClientState';
import mediaPlayer from './MediaPlayer';
import creator from './Creator';
//import effects from './ClientEffects';
import stars from './Stars';

/**
 * Telephenesis class for user interface methods.
 * @constructor
 **/
function Interface() {
	// var currentOrderLink;
	var me = this;

	this.order = CONSTS.ORDER.GALAXY;
	this.view = CONSTS.VIEW.GALAXY;

	/** Element which holds messages shown to user. **/
	var messageElement;

	/**
	 * The ID of the setTimeout timer being used to display
	 * the current message.
	 * @type {number}
	 **/
	var messageTimerID = null;

	/** Whether or not the mouse is being click-dragged. **/
	var draggingMouse = false;

	/** The last saved position of the mouse. **/
	var lastMousePos = null;

	/** The function to run pending user confirmation. **/
	var confirmationCallback = null;

	this.init = function() {
		messageElement = document.getElementById('notification');

		spc.moveCallbacks.push(stars.drawLineStep);

		//@REVISIT belongs in Navigation.js?:
		COR.addClassListener('sort', 'click', onSortClick);

		window.addEventListener('mousedown', onMouseDown);
		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('mouseup', onMouseUp);

		window.addEventListener('scroll', function(eve) {
			window.requestAnimationFrame(stars.drawLineStep);
		});

		////REVISIT can we guarantee this will run AFTER
		//clientEffects's listener does on every browser?  if it
		//doesn't, the canvas will be cleared after we draw the stars:
		window.addEventListener('resize', () => {
			window.requestAnimationFrame(stars.drawLineStep);
		});

		var menuToggleElement = document.getElementsByClassName('menuToggle')[0]; ////
		// currentOrderLink = document.getElementsByClassName('sort active')[0]; ///REVISIT naming/architecture

		// Open header menu when button is clicked
		menuToggleElement.addEventListener('click', toggleMenu);

		COR.addClassListener('confirmation-link', 'click', onConfirmationLinkClick);

		window.addEventListener('keydown', onKeyDown);
	}

	/**
	 * Called when all components have loaded.
	 * @see ClientState#addComponent
	 **/
	this.ready = function() {
		stars.generateConstellationLines();


		if(localStorage.getItem('firstVisit') == null) {
			// Open help page on first visit:
			//@REVISIT-3 probably temporary
			navigation.navigate('/help');

			localStorage.setItem('firstVisit', true);
		}

		// If loaded URL contains a query string:
		//@TODO-1 revisit implementation; probably render on the server:
		//if(window.location.search.length) {
		//    // Check for view and/or order in query string:
		//    //@TODO-2 ensure IE support:
		//    var params = new URLSearchParams(location.search);
		//    var initialOrder = params.get('order');
		//    var initialView = params.get('view');

		//    // If there's a view or order in the query string:
		//    if(initialOrder || initialView) {
		//        // Display the view and/or order:
		//        me.sort(initialOrder, initialView);
		//    }
		//}
	}

	/**
	 * Displays a message to the user.
	 * @param {string} message - The message to display.
	 * @param {string} [type="notification"] - The type of message.
	 * @param {number} [duration=5000] - How long to display the message for.
	 **/
	this.displayMessage = function(message, type = "notification", duration = 5000) { ///REVISIT naming
		clearMessageTimer();

		messageElement.innerText = message;
		messageElement.className = type;

		///REVISIT might already be appended to body.. should we check?
		document.body.appendChild(messageElement);

		if(duration) { ///REVISIT more explicit check?
			///TODO fade out
			messageTimerID = setTimeout(() => me.hideMessage(), duration);
		}
	}

	/**
	 * Hide the message displayed to the user, if any.
	 **/
	this.hideMessage = function() { ///REVISIT rename to clearMessage ?
		clearMessageTimer();

		limbo.appendChild(messageElement);
	}

	function clearMessageTimer() {
		if(messageTimerID !== null) {
			clearTimeout(messageTimerID);
			messageTimerID = null;
		}
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

	this.confirmAction = function(message, action) {
		var confirmActionEle = COR._('#confirmAction-page');
		confirmActionEle.querySelector('.confirmation-message').innerText = message;
		confirmationCallback = action;

		navigation.open('confirmAction');
	}

	function onConfirmationLinkClick(event) {
		event.preventDefault();

		if(confirmationCallback) {
			confirmationCallback();
		}

		//@TODO improve architecture:
		navigation.close(document.getElementById('confirmAction-page'));
	}

	function onMouseDown(event) {
		draggingMouse = true;
		lastMousePos = new Vector(event.clientX, event.clientY);
	}

	function onMouseMove(event) {
		// If dragging the mouse on a non-galaxy view:
		if(draggingMouse && me.view != CONSTS.VIEW.GALAXY) {
			// Scroll the window by mouse delta:
			var currentMousePos = new Vector(event.clientX, event.clientY);
			var difference = currentMousePos.subtract(lastMousePos);
			window.scrollBy(-difference.x, -difference.y);
			lastMousePos = currentMousePos;
		}
	}

	function onMouseUp(event) {
		draggingMouse = false;
	}

	function onKeyDown(e) {
		// Ignore key presses with modifier keys:
		if(e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) {
			return true;
		}

		///REVISIT better way to check if it's a form element?
		if(["INPUT", "TEXTAREA"].includes(e.target.tagName.toUpperCase())) { // .toUpperCase() out of paranoia
			return true;
		}

		switch(e.keyCode) {
			// Left arrow:
			case 37: {
				e.preventDefault();

				// If a star is currently active in the media player:
				if(clientState.playingStar) {
					// If there's a previous star:
					if(clientState.playingStar.originStarID != -1) {
					//    var previousStar = stars.clientStars[clientState.playingStar.originStarID];
					//    mediaPlayer.playStar(previousStar);
						navigation.navigate('/star/' + clientState.playingStar.originStarID);
					}
				}
			} break;

			// Right arrow:
			case 39: {
				e.preventDefault();

				if(clientState.playingStar) {
					///TODO better solution:
					var nsid = clientState.playingStar.element.getAttribute('data-next');
					/// if next star isn't loaded? if there is no next star?
					//var nextStar = stars.clientStars[nsid];
					//console.log(stars.clientStars);
					//if(!nextStar) {
					//    ///REVISIT
					//    console.log('no next star');
					//    return false;
					//}

					//mediaPlayer.playStar(nextStar);

					navigation.navigate('/star/' + nsid);
				}
			} break;

			// Spacebar:
			case 32: {
				if(!clientState.activeWindow) {
					e.preventDefault();

					mediaPlayer.audio.element.paused ? mediaPlayer.audio.play() : mediaPlayer.audio.pause();
				}
			} break;

			// ESC / Escape:
			case 27: {
				///@TODO probably come up with prettier check:
				if(creator.workingStar) {
					creator.cancel();
				} else {
					if(HistoryTime.state.url != '/') {
						navigation.navigate('/'); //// page title

						if(me.view != CONSTS.VIEW.GALAXY) {
							me.sort(CONSTS.VIEW.GALAXY);
						}
					}
				}
			} break;
		}
	};

	function toggleMenu(e) {
		var menu = document.getElementById('menu');
		var isActive = COR.cc(menu, 'active');
		if(isActive) {
			e.target.innerHTML = '|||';
			COR.rc(e.target, 'active');
			COR.rc(menu, 'active');
		} else {
			e.target.innerHTML = '&rarr;';
			COR.ac(e.target, 'active');
			COR.ac(menu, 'active');
		}
	}

	function onSortClick(event) {
		event.preventDefault();

		var sortLinkEle = event.target;

		if(event.target.classList.contains('disabled')) {
			return false;
		}

		//me.sort(
		//    event.target.getAttribute('data-order'),
		//    event.target.getAttribute('data-view'),
		//    event.target
		//);

		var order = event.target.getAttribute('data-order');
		var view = event.target.getAttribute('data-view');

		// Update the URI:
		var newURI = "/";

		if(order) {
			newURI += order.toLowerCase();

			//if(view) {
			//    newURI += '&';
			//} else {
			//    newURI += '?';
			//}

			//newURI += 'order=' + order.toLowerCase();
		}

		//@REVISIT architecture:
		if(view && view != CONSTS.VIEW.GALAXY) {
			newURI += '?view=' + view;
			//newURI += '?view=' + view.toLowerCase();
		}

		navigation.navigate(newURI);
	}

	/**
	 * Sort the stars in the interface and display them in {@link view}.
	 * @param {CONSTANTS.ORDER} order - The nature of the ordering of the stars.
	 * @param {CONSTANTS.VIEW} view - The view by which to show the stars.
	 * @param {Element} [clickedEle = false] - The sort link that was clicked to run this method.
	 **/
	this.sort = function(order, view, clickedEle = false) {

		console.log('Navigation.sort(): ' + [order, view]);
		///REVISIT not into all this .toLowerCase() business... better design?

		if(order) {
			// Ensure uppercase:
			//order = order.toUpperCase();

			// If there's an order already, remove its class from document.body:
			if(me.order) {
				COR.rc(document.body, me.order.toLowerCase() + '-order'); ////
			}

			// Add the new order's class to document.body:
			COR.ac(document.body, order.toLowerCase() + '-order'); ////

			// If the order is GALAXY or CONSTELLATIONS, so is the view:
			if(order == CONSTS.ORDER.GALAXY || order == CONSTS.ORDER.CONSTELLATIONS) {
				////REVISIT this solution; not sure it's best architecture; for
				//one, we're not referencing CONSTS.VIEW but CONSTS.ORDER:
				view = order;

			// If view is not GALAXY:
			} else {
				// If no view was provided to sort():
				if(!view) {
					if(me.view != CONSTS.VIEW.GALAXY && me.view != CONSTS.VIEW.CONSTELLATIONS) { ///TODO remove constellations
						// Do nothing; keep current view.

					// If we're in galaxy view, default to 'list' so that new order can be shown:
					} else {
						// There's no current table view; default to list:
						view = CONSTS.VIEW.LIST;
					}
				}
			}

			// Convert to upper in case of user input:
			//me.order = order.toUpperCase();
			me.order = order;
		}

		// If a view was supplied to sort() and it is different from the current one:
		if(view && view != me.view) {
			// Ensure uppercase:
			//view = view.toUpperCase();

			// If there's already a view, remove its class from document.body:
			if(me.view) {
				COR.rc(document.body, me.view.toLowerCase() + '-view'); ////
			}

			// Add the new view's class to document.body:
			COR.ac(document.body, view.toLowerCase() + '-view'); ////

			// Convert to upper in case of user input:
			//me.view = view.toUpperCase();
			me.view = view;
		}

		///TODO only do this stuff if the value has changed:

		// Update labels that display the current order:
		for(var orderLabelEle of document.getElementsByClassName('current-order')) {
			orderLabelEle.innerText = locale[me.order.toUpperCase()].toLowerCase();
		}

		// Update any labels that display the current view:
		for(var viewLabelEle of document.getElementsByClassName('current-view')) {
			viewLabelEle.innerText = locale[me.view.toUpperCase()].toLowerCase();
		}

		// Update the header of the view (to reflect the order):
		for(var viewHeaderEle of document.getElementsByClassName('view-header')) {
			viewHeaderEle.innerText = locale['SORT-BY-' + me.order.toUpperCase()];
		}

		// Actually sort and position the stars:
		stars.sort(me.order, me.view);
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

	/**
	 * Create a loading graphic element.
	 * @returns Element
	 **/
	//@TODO revisit naming/implementation:
	this.createLoaderElement = function() {
		return (
			<span>
				<img class="loading-img" src="/images/loading-orbit_001.gif" />
				<span>Loading...</span>
			</span>
		);
	}
}

export default new Interface();
