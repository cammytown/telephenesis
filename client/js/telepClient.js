import cor from './libs/minlab/cor';
// import Spc from './libs/minlab/spc';
// import navigate from "./navigate";
// import starSystem from "./starSystem";

import admin from "./admin";

import clientState from './components/ClientState';
import Interface from './components/Interface';
import Stars from './components/Stars';
import Navigation from './components/Navigation';
import Forms from './components/Forms';
import ClientEffects from './components/ClientEffects';
import mediaPlayer from './components/MediaPlayer';
import Admin from './components/Admin';
import Creator from "./components/Creator";

// import "./constellations.scss";

export { TelepClient };

window.addEventListener('load', function() { ///DOMonload?
	new TelepClient().init(); /// change architecture after pondering on it some more
});

function TelepClient() {
	var me = this;

	me.init = function() { /// doesn't need to be property
		clientState.addComponent(Interface);
		clientState.addComponent(ClientEffects);
		clientState.addComponent(Stars);
		clientState.addComponent(Navigation);
		clientState.addComponent(Forms);
		clientState.addComponent(mediaPlayer);
		clientState.addComponent(Admin);
		clientState.addComponent(Creator);
		clientState.init();

	}
}
