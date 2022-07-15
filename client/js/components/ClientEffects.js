import clientState from './ClientState';

export default new ClientEffects();

function ClientEffects() {
	var me = this;

	me.canvas;
	me.context;

	this.init = function() {
		me.canvas = document.getElementById('uiEffects');
		me.context = me.canvas.getContext('2d');

		// Run onResize to initialize canvas size
		me.onResize();

		// Listen for window resize
		window.addEventListener('resize', me.onResize);
	}

	this.onResize = function() {
		///REVISIT I don't like this solution but can't think of something
		//better right now:
		// Reset height of canvas so it is not a part of scrollWidth/scrollHeight
		me.canvas.width = 0;
		me.canvas.height = 0;

		me.canvas.width = document.documentElement.scrollWidth;
		me.canvas.height = document.documentElement.scrollHeight;
		//me.canvas.width = document.body.offsetWidth;
		//me.canvas.height = document.body.offsetHeight;
	}
}
