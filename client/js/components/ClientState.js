import mediaPlayer from './MediaPlayer';

/**
 * Holds data relevant to the client and initializes components.
 * @constructor
 **/
function ClientState() {
	var me = this;

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

	/**
	 * Calls .init method on each component, and then calls .ready() on each component.
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

		// for (var componentIndex = 0; componentIndex < uninitializedComponents.length; componentIndex++) {
		//while(uninitializedComponents.length) {
			//uninitializedComponents.shift().init();
		//}

		// for (var callbackIndex = 0; callbackIndex < readyCallbacks.length; callbackIndex++) {
		// 	var readyCallback = readyCallbacks[callbackIndex];
		// 	readyCallback();
		// }
	}

	// me.observeEvent = function(event) { ///REVISIT naming/architecture
	// }

	// me.whenReady = function(callback) { ///REVISIT naming/architecture
	// 	readyCallbacks.push(callback);
	// }
}

export default new ClientState();
