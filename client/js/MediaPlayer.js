import cor from './libs/minlab/cor';

import Aud from './libs/minlab/aud';

import clientState from './ClientState';

export default new MediaPlayer();

function MediaPlayer() {
	var me = this;

	me.audio;

	this.init = function() {
		me.audio = new Aud({
			elementID: 'aud',
			seekbar: document.getElementById('playbackProgress'),
		});

		me.audio.element.addEventListener('timeupdate', onMediaPlayerUpdate);
		me.audio.element.addEventListener('ended', onMediaPlayerFinish);
	}

	function onMediaPlayerUpdate() {
		///REVISIT bit ugly:

		clientState.playingStar.getElementsByClassName('time')[0].innerHTML = me.audio.timeString;
		// cor._('#playbackProgressBar').style.width = (me.audio.playbackProgress * 100.0) + "%";
		cor._('#playbackProgressBar').style.width = (me.audio.playbackProgress * 100.0) + "%";
	}

	function onMediaPlayerFinish() {
		cor.rc(clientState.playingStar, 'active');

		if(clientState.playingStar.getAttribute('data-next')) {
			var star = document.getElementById('s' + clientState.playingStar.getAttribute('data-next'));
			load(star);
		} else {
			clientState.playingStar = false;
		}
	}
}
