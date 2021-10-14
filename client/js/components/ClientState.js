import mediaPlayer from './MediaPlayer';

function ClientState() {
	var me = this;

	me.actingStar = null;
	me.playingStar = null;
	me.activeWindow = false;

	var uninitializedComponents = []; ///REVISIT perhaps unnecessary
	// var readyCallbacks = [];

	this.init = function() {
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
