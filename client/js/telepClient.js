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

		initializeAudio();
	}

	function initializeAudio() {
		clientState.audio.element.addEventListener('timeupdate', playerUpdate);
		clientState.audio.element.addEventListener('ended', playerFinish);

		function playerUpdate() {
			///REVISIT bit ugly:

			clientState.playingStar.getElementsByClassName('time')[0].innerHTML = clientState.audio.timeString;
			// cor._('#playbackProgressBar').style.width = (clientState.audio.playbackProgress * 100.0) + "%";
			cor._('#playbackProgressBar').style.width = (clientState.audio.playbackProgress * 100.0) + "%";
		}

		function playerFinish() {
			cor.rc(clientState.playingStar, 'active');

			if(clientState.playingStar.getAttribute('data-next')) {
				var star = document.getElementById('s' + clientState.playingStar.getAttribute('data-next'));
				load(star);
			} else {
				clientState.playingStar = false;
			}
		}
	}
}


