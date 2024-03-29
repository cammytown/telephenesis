/**
 * Handles history state navigation in web browsers.
 */
class HistoryTime { //v0.1
	/**
	 * Create a new instance of this class.
	 * @param [gtag] {Object}
	 */
	constructor(gtag = false) {
		this.gtag = gtag;

		this.state = {
			title: document.title,
			//path: '/',
			url: location.pathname + location.search, ///REVISIT; should we prefer location.href?
			updating: false
		};

		this.pathBinds = {};

		this.bindPropToPath = this.bindPropToPath.bind(this);
		this.popState = this.popState.bind(this);

		window.addEventListener('popstate', this.popState, false);

		///REVISIT; I think this is so we have a customized state object; but feels weird-- make sure we need it:
		/// I think one thing this does is makes sure state.url does not contain the domain?
		history.replaceState(this.state, this.state.title, this.state.url);

		this.activePathBinds = [];
	}

	// goBack(event) {
	// 	event.preventDefault();
	// 	history.back();
	// }

	popState(event) {
		if(!event.state) {
			//@TODO-3 I don't fully understand when event.state is null. I
			//think, for one, it's null when using hash/anchor links as the
			//document has not changed

			return false;
		}

		this.state = event.state;
		// var pageTitle = this.state.url.split('/').pop();
		if(this.gtag) {
			this.gtag('config', 'GA_TRACKING_ID', {'page_path': this.state.url});
		}

		this.navigateTo(this.state.url, this.state.title, false);
	}

	navigateTo(path, pageTitle, updateState = true) {
		// console.log('navigating to ' + path); ///TODO remove or create debug toggle

		if(path[0] != '/') path = '/' + path; ///REVISIT is this what we want to do?

		// Call any page unload callbacks:
		//@REVISIT do we always want to clear the whole array on every
		//navigateTo() call?
		while(this.activePathBinds.length) { 
			var activePathBind = this.activePathBinds.pop();
			this.deactivatePathBind(activePathBind);
		}

		// Run wildcard callbacks:
		for (var constantBindIndex = 0; constantBindIndex < this.pathBinds['*'].length; constantBindIndex++) {
			var constantPathBind = this.pathBinds['*'][constantBindIndex];
			this.activatePathBind(constantPathBind, path);
		}

		// Run callbacks for target path:
		if(this.pathBinds.hasOwnProperty(path)) {
			for(var bindIndex = 0; bindIndex < this.pathBinds[path].length; bindIndex++) {
				var pathBind = this.pathBinds[path][bindIndex];
				this.activatePathBind(pathBind, path);
			}
		}

		document.title = pageTitle; //`

		if(updateState) {
			this.state.title = pageTitle; //`
			this.state.url = path;
			// this.state.path = path;
			history.pushState(this.state, this.state.title, this.state.url);
		}
	}

	activatePathBind(pathBind, path) {
		if(!pathBind.oneWay) {
			this.activePathBinds.push(pathBind);
		}

		switch(pathBind.nature) {
			case 'callback': {
				pathBind.pathCallback(path);
			} break;

			case 'prop': {
				pathBind.component.setState({ [pathBind.property]: pathBind.onValue });
			} break;

			default: {
				///TODO error? maybe we don't really care.
			}
		}
	}

	deactivatePathBind(pathBind) {
		switch(pathBind.nature) {
			case 'callback': {
				if(pathBind.offCallback) {
					pathBind.offCallback();
				}
			} break;

			case 'prop': {
				activePathBind.component.setState({
					[activePathBind.property]: activePathBind.offValue
				});
			} break;
		}
	}

	bindPathToCallback(path, pathCallback, offCallback = false) {
		if(!this.pathBinds.hasOwnProperty(path)) {
			this.pathBinds[path] = [];
		}

		var pathBind = {
			nature: 'callback',
			pathCallback,
			offCallback
		};

		if(this.state.url == path) {
			this.activatePathBind(pathBind);
		}

		this.pathBinds[path].push(pathBind);
	}

	bindPropToPath(path, component, property, onValue, offValue = false, oneWay = false) {
		// path = this.boilPath(path);

		if(!this.pathBinds.hasOwnProperty(path)) {
			this.pathBinds[path] = [];
		}

		var pathBind = {
			nature: 'prop',
			component,
			property,
			onValue,
			offValue,
			oneWay
		};

		if(this.state.url == path) {
			this.activatePathBind(pathBind);
		}

		this.pathBinds[path].push(pathBind);
	}

	boilPath(path) {
		///TODO doesn't do anything at the moment. remove?

		// var urlInstance = new URL(path);
		// return urlInstance.hostname + urlInstance.pathname;

		return path;
	}
}

////
var singleInstance = {};
if(typeof window !== "undefined") {
	singleInstance = new HistoryTime();
}

export default singleInstance;
