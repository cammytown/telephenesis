import cor from '../libs/minlab/cor';
import Aud from '../libs/minlab/aud';

import clientState from './ClientState';

export default new MediaPlayer();

function MediaPlayer() {
	var me = this;

	me.audio;

	var lastSyncTime;
	var config = {
		syncInterval: 30 * 1000,
		partialPlaySeconds: 5,
		longPlayPercent: 50,
	};

	var mediaStates = [];
	var activeMediaState = null;
	var pendingServerUpdates = [];	

	this.init = function() {
		me.audio = new Aud({
			elementID: 'aud',
			seekbar: document.getElementById('playbackProgress'),
		});

		me.audio.element.addEventListener('timeupdate', onMediaTimeUpdate);
		me.audio.element.addEventListener('ended', onMediaPlayerFinish);

		////DEBUG:
		// pendingServerUpdates.push({ type: 'longPlay', starID: 42 });
		// serverSync();

		setInterval(serverSync, config.syncInterval); ////TODO probably don't use or use something in addition to setInterval
	}

	this.playStar = function(clientStar) {
		// If star is already focused by player:
		if(clientState.playingStar == clientStar) {
			// Toggle playback play/pause:
			me.audio.element.paused ? me.audio.play() : me.audio.pause();

		} else { // Loading a new star into the player
			// If there's already a star loaded:
			if(clientState.playingStar) {
				cor.rc(clientState.playingStar.element, "active");
			}


			clientState.playingStar = clientStar;
			cor.ac(clientStar.element, "active");

			// Load the new star's media:
			me.audio.load(clientStar.linkElement.getAttribute('data-mediaURL'));
			// me.audio.load('/music/'+sid+'.mp3');

			if(activeMediaState) {
				mediaStates[clientStar.id] = activeMediaState;
			}

			if(mediaStates[clientStar.id]) {
				activeMediaState = mediaStates[clientStar.id];
			} else {
				activeMediaState = {
					lastUpdateMediaTime: 0,
					totalMediaPlaySeconds: 0,
					flags: {
						partialPlay: false,
						longPlay: false,
					},
				}
			}

			// When we have media metadata (i.e. length), begin streaming:
			me.audio.element.addEventListener('loadedmetadata', function() {
				me.audio.play();
			}, {
				once: true // Remove this listener after running. /// Why not just put this listener in .init and remove `once` property? /// browser support?
			});
		}
	}

	function onMediaTimeUpdate(event) {
		// Update playback time label:
		clientState.playingStar.element.getElementsByClassName('playbackTime')[0].innerHTML = me.audio.timeString;

		// Update width of playback progress bar:
		cor._('#playbackProgressBar').style.width = (me.audio.playbackProgress * 100.0) + "%";

		// Get time since last run:
		var delta = me.audio.element.currentTime - activeMediaState.lastUpdateMediaTime;
		activeMediaState.lastUpdateMediaTime = me.audio.element.currentTime;

		// Add to total play time of media:
		activeMediaState.totalMediaPlaySeconds += delta;

		// Check if played long enough to ping server:
		if(!activeMediaState.flags.longPlay) {
			if(!activeMediaState.flags.partialPlay) {
				// If played long enough to flag partial play:
				if(activeMediaState.totalMediaPlaySeconds >= config.partialPlaySeconds) {
					activeMediaState.flags.partialPlay = true;
					pendingServerUpdates.push({ type: 'partialPlay', starID: clientState.playingStar.id });
				}
			}

			// If played long enough to flag long play:
			var totalPlayTimeFloat = activeMediaState.totalMediaPlaySeconds / me.audio.element.duration;
			if(totalPlayTimeFloat >= config.longPlayPercent / 100) {
				activeMediaState.flags.longPlay = true;
				pendingServerUpdates.push({ type: 'longPlay', starID: clientState.playingStar.id });
			}
		}
	}

	function onMediaPlayerFinish(event) {
		cor.rc(clientState.playingStar.element, 'active');

		if(clientState.playingStar.element.getAttribute('data-next')) {
			var star = document.getElementById('s' + clientState.playingStar.element.getAttribute('data-next'));
			load(star);
		} else {
			clientState.playingStar = false;
		}
	}

	function serverSync() {
		// Do nothing if there are no server updates to sync ////TODO still sync but with less regularity (to check for client updates)
		if(!pendingServerUpdates.length) {
			return false;
		}

		console.log(pendingServerUpdates);

		var request = {
			method: "POST",
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				serverUpdates: pendingServerUpdates
			})
		}

		fetch('/ajax/sync', request) ////TODO: to be moved
			.then(response => response.json())
			.then(result => {
				///TODO retrieve new information?
				console.log(result);
			});

		pendingServerUpdates = [];
	}
}
