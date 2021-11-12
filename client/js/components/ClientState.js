//import mediaPlayer from './MediaPlayer';
import CONSTS from '../../../abstract/constants';
import Stars from './Stars';

/**
 * Holds data relevant to the client and initializes components.
 * @constructor
 **/
function ClientState() {
	var me = this;

	/**
	 * The user's bookmarks.
	 * @type {ClientStar[]}
	 **/
	this.bookmarks = [];

	/**
	 * The star being created or interacted with by the user.
	 * @type {ClientStar}
	 **/
	this.actingStar = null;

	/**
	 * The star currently being played by the media player.
	 * @type {ClientStar}
	 **/
	this.playingStar = null;

	/**
	 * The element of the page currently open on the client.
	 * @type {Element}
	 **/
	this.activeWindow = false;

	/**
	 * Number of creation tickets available to user.
	 * @type {number}
	 **/
	this.creationTickets = null;

	/**
	 * Number of recreation tickets available to user.
	 * @type {number}
	 **/
	this.recreationTickets = null;

	var components = []; ///REVISIT perhaps unnecessary
	// var readyCallbacks = [];

	this.init = function() {
		///REVISIT placement... maybe ticket count retrieval should go into a component:
		me.creationTickets = parseInt(document.getElementById('creation-tickets').value);
		me.recreationTickets = parseInt(document.getElementById('recreation-tickets').value);

		if(document.readyState != 'complete') {
			document.addEventListener("DOMContentLoaded", initializeComponents);
		} else {
			initializeComponents();
		}
	}

	/**
	 * Calls .init() on each component, and then calls .ready() on each component.
	 **/
	function initializeComponents() {
		// Call init() on each component:
		for(var component of components) {
			component.init();
		}

		// If component has a ready function, call it.
		for(var component of components) {
			if(typeof component.ready === 'function') {
				component.ready();
			}
		}

		readBookmarksCache();

		// for (var componentIndex = 0; componentIndex < uninitializedComponents.length; componentIndex++) {
		//while(uninitializedComponents.length) {
			//uninitializedComponents.shift().init();
		//}

		// for (var callbackIndex = 0; callbackIndex < readyCallbacks.length; callbackIndex++) {
		// 	var readyCallback = readyCallbacks[callbackIndex];
		// 	readyCallback();
		// }
	}

	function readBookmarksCache() { ///REVISIT placement
		var bookmarksInputEle = document.getElementById('user-bookmarks');
		for(var starID of bookmarksInputEle.value.split(',')) {
			me.bookmarks.push(Stars.clientStars[parseInt(starID)]);
		}
	}

	///REVISIT architecture:
	/**
	 * Run an action.
	 * @param {CONSTS.ACTION} action
	 **/
	this.act = function(action) {
		console.log('acting: ' + action);
		switch(action) {
			case CONSTS.ACTION.USE_CREATION_TICKET: {
				me.creationTickets -= 1;
			} break;

			case CONSTS.ACTION.USE_RECREATION_TICKET: {
				me.recreationTickets -= 1;
			} break;

			default: {
				throw "ClientState.act(): unhandled action: " + action;
			}
		}

		me.update([action]);
	}

	/**
	 * Updates elements of the interface to reflect new state.
	 **/
	this.update = function(actions = Object.values(CONSTS.ACTION)) { ///REVISIT naming; updateState? updateInterface?
		// For each state-watcher, run relevant method:

		for(var action of actions) {
			switch(action) {
				case CONSTS.ACTION.TOGGLE_BOOKMARK: {
					//var bookmarkCount = document.getElementsByClassName();
					for(var bookmarkSortLink of document.getElementsByClassName('bookmarks-sort')) {
						if(me.bookmarks.length) {
							if(bookmarkSortLink.classList.contains('disabled')) {
								bookmarkSortLink.classList.remove('disabled');
							}
						} else {
							bookmarkSortLink.classList.add('disabled');
						}
					}
				} break;

				case CONSTS.ACTION.USE_CREATION_TICKET: {
					var countEle = document.querySelector('.creationTickets .count');
					countEle.innerText = me.creationTickets;
				} break;

				case CONSTS.ACTION.USE_RECREATION_TICKET: {
					var countEle = document.querySelector('.recreationTickets .count');
					countEle.innerText = me.recreationTickets;
				} break;

				default: {
					///REVISIT
					throw "Unhandled action: " + action;
				}
			}
		}
	}

	// function onReady() { ///REVISIT naming/architecture
	// 	mediaPlayer.audio.element.addEventListener('timeupdate', onMediaTimeUpdate);
	// }

	/**
	 * Adds a new components to the client.
	 * @param {Object} component - The component to be added. Requires an .init function.
	 */
	this.addComponent = function(component) {
		components.push(component);
		//uninitializedComponents.push(component);
	};

	// me.observeEvent = function(event) { ///REVISIT naming/architecture
	// }

	// me.whenReady = function(callback) { ///REVISIT naming/architecture
	// 	readyCallbacks.push(callback);
	// }
}

export default new ClientState();
