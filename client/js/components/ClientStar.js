import spc from '../libs/minlab/spc'; //// ultimately whatever spc becomes probably won't output a singleton

// import clientState from './components/ClientState';
import Star from '../../../abstract/Star.js';

export default ClientStar;

function ClientStar(element) {
	init(element);

	// Inherits properties from Star.js ...

	me.element;
	me.linkElement;
	me.textElement;

	me.fileReady = false;
	me.isPlaced = false;

	function init(element) {
		Star.call(this);

		me.element = element;
		me.linkElement = me.element.getElementsByTagName('a')[0];
		me.textElement = me.element.children[1];
		me.textElement.className = 'progress';

		spc.map.appendChild(workingStar.element);
	}
}
