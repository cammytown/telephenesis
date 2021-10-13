import mediaPlayer from './MediaPlayer';

function ClientState() {
	var me = this;

	me.actingStar = null;
	me.playingStar = null;
	me.activeWindow = false;

	var uninitializedComponents = []; ///REVISIT perhaps unnecessary
	// var readyCallbacks = [];

	var config = {
		partialPlaySeconds: 5,
	};

	var mediaState = {
		lastUpdateMediaTime: 0,
		totalMediaPlaySeconds: 0,
		pendingPings: {
			partialPlay: false,
			longPlay: false,
		},
	};

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

		mediaPlayer.audio.element.addEventListener('timeupdate', onMediaTimeUpdate); ///REVISIT doesn't really fit into the generic structure this class almost meets

		// for (var callbackIndex = 0; callbackIndex < readyCallbacks.length; callbackIndex++) {
		// 	var readyCallback = readyCallbacks[callbackIndex];
		// 	readyCallback();
		// }
	}

	function onMediaTimeUpdate(event) {
		// Get time since last run:
		var delta = mediaPlayer.audio.element.currentTime - mediaState.lastUpdateMediaTime;
		mediaState.lastUpdateMediaTime = mediaPlayer.audio.element.currentTime;

		// Add to total play time of media:
		mediaState.totalMediaPlaySeconds += delta;

		// Check if played long enough to ping server:
		if(mediaState.totalMediaPlaySeconds > config.partialPlaySeconds) { /// what if track is very short?
			// clientState.observeEvent('partialPlay', )

			// var request = {
			// 	method: "POST",
			// 	headers: {
			// 		'Content-Type': 'application/json',
			// 	},
			// 	body: JSON.stringify()
			// }

			// fetch('/ajax/update', ) ////TODO: to be moved

			mediaState.pendingPings

			console.log(mediaState.totalMediaPlaySeconds);
		}

	}

	// me.observeEvent = function(event) { ///REVISIT naming/architecture
	// }

	// me.whenReady = function(callback) { ///REVISIT naming/architecture
	// 	readyCallbacks.push(callback);
	// }
}

export default new ClientState();
