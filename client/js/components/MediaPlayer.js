import cor from '../libs/minlab/cor';
import Aud from '../libs/minlab/aud';

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

	this.playStar = function(starElement) {
		if(starElement == clientState.playingStar) {
			// If already playing star, toggle play/pause:
			me.audio.element.paused ? me.audio.play() : me.audio.pause();

		} else {
			if(clientState.playingStar) { // If there's already a star loaded
				cor.rc(clientState.playingStar, "active");
			}

			clientState.playingStar = starElement;
			cor.ac(starElement, "active");

			// var time = starElement.getElementsByTagName('span')[1];

			// Load the new star's media:
			me.audio.load(starElement.getElementsByTagName('a')[0].href);
			// me.audio.load('/music/'+sid+'.mp3');

			// When we have media metadata (i.e. length), begin streaming:
			me.audio.element.addEventListener('loadedmetadata', function() {
				me.audio.play();
			}, {
				once: true // Remove this listener after running. /// Why not just put this listener in .init and remove `once` property? /// browser support?
			});
		}
	}

	function onMediaPlayerUpdate(event) {
		// Update playback time label:
		clientState.playingStar.getElementsByClassName('playbackTime')[0].innerHTML = me.audio.timeString;

		// Update width of playback progress bar:
		cor._('#playbackProgressBar').style.width = (me.audio.playbackProgress * 100.0) + "%";
	}

	function onMediaPlayerFinish(event) {
		cor.rc(clientState.playingStar, 'active');

		if(clientState.playingStar.getAttribute('data-next')) {
			var star = document.getElementById('s' + clientState.playingStar.getAttribute('data-next'));
			load(star);
		} else {
			clientState.playingStar = false;
		}
	}
}
