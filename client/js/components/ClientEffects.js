import clientState from './ClientState';

export default new ClientEffects();

function ClientEffects() {
	var me = this;

	me.canvas = 'test';
	me.context = 'test';

	this.init = function() {
		me.canvas = document.getElementById('uiEffects');
		me.context = me.canvas.getContext('2d');

		// Run onResize to initialize canvas size
		onResize();

		// Listen for window resize
		window.addEventListener('resize', onResize);

		function onResize() {
			me.canvas.width = document.body.offsetWidth;
			me.canvas.height = document.body.offsetHeight;
		}
	}
}
