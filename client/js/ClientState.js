import Aud from './libs/minlab/aud';

function ClientState() {
	this.audio = new Aud({
		elementID: 'aud',
		seekbar: document.getElementById('playbackProgress'),
	});

	this.actingStar;
	this.playingStar;
}

export default new ClientState();