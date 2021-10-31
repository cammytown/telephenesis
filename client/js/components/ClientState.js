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

	var uninitializedComponents = []; ///REVISIT perhaps unnecessary
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

	me.addComponent = function(component) {
		uninitializedComponents.push(component);
	};

	function initializeComponents() {
		// for (var componentIndex = 0; componentIndex < uninitializedComponents.length; componentIndex++) {
		while(uninitializedComponents.length) {
			uninitializedComponents.shift().init();
		}

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
