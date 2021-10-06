import cor from './minlab/cor';
import Spc from './minlab/spc';
import Aud from './minlab/aud';

import ui from "./ui";
// import navigate from "./navigate";
// import starSystem from "./starSystem";
import creation from "./creation";
import admin from "./admin";


// import "./constellations.scss";

export { Telep };

window.addEventListener('load', function() { ///DOMonload?
	new Telep().init(); /// change architecture after pondering on it some more
});

function Telep() {
	var me = this;

	// var state = { page: 'index' };

	// var aud;
	var spc;

	me.aud;

	me.actingStar;
	me.playingStar;

	me.init = function() { /// doesn't need to be property
		// spc = new Spc('spcE');
		me.aud = new Aud({
			elementID: 'aud',
			// callbacks: {
			// 	'timeupdate': playerUpdate,
			// 	'ended': playerFinish,
			// },
			seekbar: document.getElementById('playbackProgress'),
		});

		ui.init(me);
		creation.init(me);
		// initializeAudio();

		// function initializeAudio() {
		// 	// aud = new Aud('aud');

			me.aud.element.addEventListener('timeupdate', playerUpdate);
			me.aud.element.addEventListener('ended', playerFinish);
		// 	// me.aud.bindSeek

		function playerUpdate() {
			// if(time) {
				me.playingStar.getElementsByClassName('time')[0].innerHTML = me.aud.timeString;
				// cor._('#playbackProgressBar').style.width = (me.aud.playbackProgress * 100.0) + "%";
				cor._('#playbackProgressBar').style.width = (me.aud.playbackProgress * 100.0) + "%";
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
		// }
	}
}


