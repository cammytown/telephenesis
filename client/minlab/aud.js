import cor from './cor';

class Aud {
	constructor(elementID = "aud") {
		this.init = this.init.bind(this);
		this.update = this.update.bind(this);

		this.elementID = elementID;
		this.element;
		this.autoplaying = false;
		document.addEventListener("DOMContentLoaded", this.init); //// backwards-compatibility
	}

	init() {
		//loa = (typeof loa === "function") ? false : loa;
		//pla = (typeof pla === "undefined") ? "aud_pla" : pla;
		//pau = (typeof pau === "undefined") ? "aud_pau" : pau;

		this.element = document.getElementById(this.elementID);
		this.element.loop = false;

		this.timeString = null;
		this.playbackProgress = null;
		this.aut = true;

		this.autoplaying = false;

		this.duration = null; this.m = null; this.s = null;

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
		this.m = this.duration / 60 | 0;
		this.s = this.duration - this.m * 60 + '';
		if(this.s.length<2) this.s = "0"+this.s;
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
		var t = this.element.currentTime | 0;
		var m = t/60 | 0;
		var s = (t-m*60)+'';
		if(s.length<2) s = "0"+s;

		if(this.m == 'null') {
			this.timeString = 'loading...';
		} else {
			this.timeString = m+':'+s+' / '+this.m+':'+this.s;
		}

		this.playbackProgress = t/this.duration;
	}
}

export default new Aud("aud");

