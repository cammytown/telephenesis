function ClientState() {
	var me = this;

	me.actingStar;
	me.playingStar;

	me.activeWindow = false;

	// Component functionality
	var uninitializedComponents = []; ///REVISIT perhaps unnecessary
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

	me.addComponent = function(component) {
		if(document.readyState != 'complete') {
			uninitializedComponents.push(component);
		} else {
			component.init();
		}
	};

	// me.whenReady = function(callback) { ///REVISIT naming/architecture
	// 	readyCallbacks.push(callback);
	// }
}

export default new ClientState();
