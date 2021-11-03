import cor from './cor';


/**
 * Simple class that wraps around an HTML5 audio element to 
 * provide a minimalistic interface for handling media.
 * @param {string} [elementID="aud"]
 * @param {Array} [callbacks]
 * @param {Element} [seekbar]
 **/
class Aud {
	constructor(options = {
		elementID: "aud",
		callbacks: [],
		seekbar: false,
	}) {
		this.init = this.init.bind(this);
		this.update = this.update.bind(this);
		this.onSeekbarClick = this.onSeekbarClick.bind(this);

		this.options = options;
		this.element;
		this.autoplaying = false;

		if(document.readyState != 'complete') {
			document.addEventListener("DOMContentLoaded", this.init);
		} else {
			this.init();
		}
	}

	/** Initialize the player and setup media events. **/
	init() {
		//loa = (typeof loa === "function") ? false : loa;
		//pla = (typeof pla === "undefined") ? "aud_pla" : pla;
		//pau = (typeof pau === "undefined") ? "aud_pau" : pau;

		this.element = document.getElementById(this.options.elementID);
		this.element.loop = false;

		if(this.options.seekbar) {
			this.options.seekbar.addEventListener('click', this.onSeekbarClick);
		}

		this.timeString = null;
		this.playbackProgress = null;
		this.aut = true;

		this.autoplaying = false;

		this.duration = null;
		this.minuteLength = null;
		this.secondLength = null;

		cor.al(this.element, 'canplay', () => {
			if(this.autoplaying) {
				this.play();
			}
		});

		cor.al(this.element, 'error', () => this.elementError());
		// cor.rl(this.element, 'canplay', this.pl);
		cor.al(this.element, 'timeupdate', () => this.update());
	}

	/** Play the active media. **/
	play() {
		this.duration = this.element.duration | 0;
		this.minuteLength = this.duration / 60 | 0;
		this.secondLength = this.duration - this.minuteLength * 60 + '';
		if(this.secondLength.length<2) this.secondLength = "0"+this.secondLength;
		this.element.play();
		return true;
	}

	/** Pause the active media. **/
	pause() {
		this.element.pause();
		return true;
	}

	/** Stop the active media. **/
	stop() {
		this.element.pause();
		this.element.currentTime = 0;

		return true;
	}

	/** Load new media into the player. **/
	load(src, autoplay = true) {
		this.autoplaying = autoplay;

		this.element.setAttribute('src', src);
		this.element.load();
	}

	/** Audio class-specific error event callback. **/
	elementError() { /// naming
		////
		console.log("Audio Error:");
		console.log(this.element.error);
	}

	/** Update the player interface as a callback for media playback time changing. **/
	update() {
		var currentTime = this.element.currentTime | 0;
		var minutes = currentTime / 60 | 0;
		var seconds = (currentTime - minutes * 60) + '';
		if(seconds.length < 2) {
			seconds = "0"+seconds;
		}

		if(this.minuteLength == 'null') {
			this.timeString = 'loading...';
		} else {
			this.timeString = minutes + ':' + seconds + ' / ' + this.minuteLength + ':' + this.secondLength;
		}

		this.playbackProgress = currentTime / this.duration;
	}

	/**
	 * Seek to playback time based on position of click in the seekbar.
	 * @param {Event} event - The click event.
	 **/
	onSeekbarClick(event) {
		var mousePos = cor.relativeToElement(
			this.options.seekbar,
			{
				x: event.clientX,
				y: event.clientY
			},
		);

		var seekFloat = mousePos.x / this.options.seekbar.offsetWidth;
		this.element.currentTime = seekFloat * this.element.duration;
	}
}

// export default new Aud("aud");
export default Aud;
