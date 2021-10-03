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
	me.playingStar;

	me.init = function() { /// doesn't need to be property
		// spc = new Spc('spcE');
		ui.init(me);
		creation.init(me);
		initializeAudio();

		function initializeAudio() {
			// aud = new Aud('aud');

			cor.al(aud.element, 'timeupdate', playerUpdate);
			cor.al(aud.element, 'ended', playerFinish);

			function playerUpdate() {
				// if(time) {
					me.playingStar.getElementsByClassName('time')[0].innerHTML = aud.timeString;
					cor._('#playbackProgressBar').style.width = (aud.playbackProgress * 100.0) + "%";
				// }
			}

			function playerFinish() {
				cor.rc(me.playingStar, 'active');

				if(me.playingStar.getAttribute('data-next')) {
					var star = document.getElementById('s' + me.playingStar.getAttribute('data-next'));
					load(star);
				} else {
					me.playingStar = false;
				}
			}
		}
	}
}


