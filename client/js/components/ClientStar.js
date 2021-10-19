import spc from '../libs/minlab/spc'; //// ultimately whatever spc becomes probably won't output a singleton

// import clientState from './components/ClientState';
import Star from '../../../abstract/Star.js';

export default ClientStar;

function ClientStar(element) { ///REVISIT element not in use atm
	var me = this;

	// Inherits properties from Star.js ...

	me.element;
	me.linkElement;
	me.titleElement;

	me.fileReady = false;
	me.isPlaced = false;

	init(element);

	function init(element) {
		Star.call(me);

		////REVISIT bad solution; also implies that this class would only be used for creation stars in which case it should be renamed:
		var element = document.getElementById('placementSymbol').cloneNode(true); /// deep parameter in IE8??

		me.element = element;
		me.linkElement = me.element.getElementsByTagName('a')[0];
		me.titleElement = me.element.getElementsByClassName('text title')[0];
		me.titleElement.className = 'progress';

		for (var propIndex = 0; propIndex < me.identityProps.length; propIndex++) {
			var property = me.identityProps[propIndex]
			me[property] = me.element.getAttribute('data-' + property);
		}

		spc.map.appendChild(me.element);
	}
}
