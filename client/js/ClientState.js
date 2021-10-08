import Aud from './libs/minlab/aud';

function ClientState() {
	this.actingStar;
	this.playingStar;

	// Audio player
	this.audio = new Aud({
		elementID: 'aud',
		seekbar: document.getElementById('playbackProgress'),
	});

	// Component functionality
	var uninitializedComponents = [];
	var readyCallbacks = [];

	document.addEventListener("DOMContentLoaded", initializeComponents);

	function initializeComponents() {
		for (var componentIndex = 0; componentIndex < uninitializedComponents.length; componentIndex++) {
			var uninitializedComponent = uninitializedComponents[componentIndex];
			uninitializedComponent.init();
		}

		for (var callbackIndex = 0; callbackIndex < readyCallbacks.length; callbackIndex++) {
			var readyCallback = readyCallbacks[callbackIndex];
			readyCallback();
		}
	}

	this.addComponent = function(component) {
		if(document.readyState != 'complete') {
			uninitializedComponents.push(component);
		} else {
			component.init();
		}
	};

	this.whenReady = function(callback) { ///REVISIT naming/architecture
		readyCallbacks.push(callback);
	}
}

export default new ClientState();