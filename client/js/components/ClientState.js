//import mediaPlayer from './MediaPlayer';
import CONSTS from '../../../abstract/constants';
import config from '../../../abstract/telep.config.js';
import Stars from './Stars';
import ClientUser from './ClientUser';
import profile from '../pages/Profile.jsx';

/**
 * Holds data relevant to the client and initializes components.
 * @constructor
 **/
function ClientState() {
	var me = this;

	/**
	 * The logged-in user.
	 * @type {ClientUser}
	 **/
	///@TODO this is currently only populated on ajax login/register
	///@TODO probably make some distinguishing 'guest' param
	this.user = new ClientUser();

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
	 * The page open on the client.
	 * @type {string}
	 **/
	///REVISIT consolidate this with activeWindow?
	///REVISIT default value; doing this mainly because changes in historystate
	//currently result in this value if going to homepage:
	this.currentPage = '';

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
			component.init(me);
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
		///@TODO probably remove with something that more generally reads
		//various properties of the logged-in user
		var bookmarksInputEle = document.getElementById('user-bookmarks');
		for(var starID of bookmarksInputEle.value.split(',')) {
			me.user.bookmarks.push(Stars.clientStars[starID]);
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
	 * @param [{Array.<CONSTS.ACTION>}] actions - The actions that occurred
	 * which necessitate interface update.
	 **/
	///@REVISIT naming; updateState? updateInterface?:
	this.update = function(actions = Object.values(CONSTS.ACTION)) {
		// Only update parts of the interface relevant to the actions taken:
		for(var action of actions) {
			switch(action) {
				case CONSTS.ACTION.TOGGLE_BOOKMARK: {
					// Enable or disable bookmark sort links based on if there are bookmarks:
					for(var bookmarkSortLink of document.getElementsByClassName('bookmarks-sort')) {
						if(me.user.bookmarks.length) {
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
	 * @param {object} component - The component to be added. Requires an .init function.
	 */
	this.addComponent = function(component) {
		components.push(component);
		//uninitializedComponents.push(component);
	};

	/**
	 * Updates interface to reflect logged-in user.
	 * @param {ClientUser} user
	 **/
	this.login = function(user) {
		me.user = user;

		// Add logged-in class to page:
		document.body.classList.add('in');

		// Enable creator interface elements if authorized:
		if(user.lv >= config.creatorLevel) {
			document.body.classList.add('creator');
		}

		// Mark all bookmarks:
		///@TODO i feel like this should be done in ClientUser... maybe a lot
		//of this block
		user.bookmarks.forEach(bookmarkedStar => {
			bookmarkedStar.element.classList.add('bookmarked');
			bookmarkedStar.isBookmarked = true;
		});

		// Re-render profile page:
		profile.render();
	}

	this.logout = function() {
		// Remove logged-in classes from interface:
		document.body.classList.remove('in');
		document.body.classList.remove('creator');

		// Unset bookmarks in the interface:
		for(var bookmarkedStar of me.user.bookmarks) {
			bookmarkedStar.element.classList.remove('bookmarked');
			bookmarkedStar.isBookmarked = false;
		}

		me.user = new ClientUser();
	}
	// me.observeEvent = function(event) { ///REVISIT naming/architecture
	// }

	// me.whenReady = function(callback) { ///REVISIT naming/architecture
	// 	readyCallbacks.push(callback);
	// }
}

export default new ClientState();
