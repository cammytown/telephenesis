import cor from './minlab/cor';
import Spc from './minlab/spc';
import aud from './minlab/aud';

import ui from "./ui";
// import navigate from "./navigate";
// import starSystem from "./starSystem";
import creation from "./creation";
import admin from "./admin";

// import "./constellations.scss";

export { Telep };

cor.al(window, 'load', function() { ///DOMonload?
	new Telep().init(); /// change architecture after pondering on it some more
});

function Telep() {
	var me = this;

	// var state = { page: 'index' };

	// var aud;
	var spc;

	me.actingStar;

	me.init = function() { /// doesn't need to be property
		// spc = new Spc('spcE');
		ui.init(me);
		creation.init(me);
		initializeAudio();

		function initializeAudio() {
			// aud = new Aud('aud');

			cor.al(aud.e, 'timeupdate', playerUpdate);
			cor.al(aud.e, 'ended', playerFinish);

			function playerUpdate() {
				// if(time) {
					playing_star.getElementsByClassName('time')[0].innerHTML = aud.t;
				// }
			}

			function playerFinish() {
				cor.rc(playing_star, 'active');

				if(playing_star.getAttribute('data-next')) {
					var star = document.getElementById('s' + playing_star.getAttribute('data-next'));
					load(star);
				} else {
					playing_star = false;
				}
			}
		}
	}
}


