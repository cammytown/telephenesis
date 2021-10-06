import cor from './cor';

///REVISIT i can't stand es5/es6 classes. If Javascript doesn't give us a way to have class variables/properties
/// accessible from submethods without dumb .bind on everything, go back to just function Aud()
export default class Aud {
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

		cor.al(this.element, 'canplay', function() {
			if(this.autoplaying) {
				this.play();
			}
		});

		cor.al(this.element, 'error', this.elementError);
		// cor.rl(this.element, 'canplay', this.pl);

		if(this.element.addEventListener) this.element.addEventListener('timeupdate', this.update);
		else if(this.element.attachEvent) this.element.attachEvent('ontimeupdate', this.update);
	}



	play() {
		this.duration = this.element.duration | 0;
		this.minuteLength = this.duration / 60 | 0;
		this.secondLength = this.duration - this.minuteLength * 60 + '';
		if(this.secondLength.length<2) this.secondLength = "0"+this.secondLength;
		this.element.play();
		return true;
	}

	pause() {
		this.element.pause();
		return true;
	}

	stop() {
		this.element.pause();
		this.element.currentTime = 0;

		return true;
	}

	load(src, autoplay = true) {
		// console.log(src);

		console.log(autoplay);
		this.autoplaying = autoplay;

		this.element.setAttribute('src', src);
		this.element.load();
	}

	elementError() { /// naming
		////
		console.log("Audio Error:");
		console.log(this.element.error);
	}

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

