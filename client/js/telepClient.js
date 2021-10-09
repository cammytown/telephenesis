import cor from './libs/minlab/cor';
// import Spc from './libs/minlab/spc';
// import navigate from "./navigate";
// import starSystem from "./starSystem";

import ui from "./ui";
import creation from "./creation";
import admin from "./admin";

import clientState from "./ClientState";

// import "./constellations.scss";

export { TelepClient };

window.addEventListener('load', function() { ///DOMonload?
	new TelepClient().init(); /// change architecture after pondering on it some more
});

function TelepClient() {
	var me = this;

	me.init = function() { /// doesn't need to be property
		ui.init(me);
		creation.init(me);
	}
}
