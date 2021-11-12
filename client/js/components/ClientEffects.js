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
		me.canvas.width = document.documentElement.scrollWidth;
		me.canvas.height = document.documentElement.scrollHeight;
		//me.canvas.width = document.body.offsetWidth;
		//me.canvas.height = document.body.offsetHeight;
	}
}
