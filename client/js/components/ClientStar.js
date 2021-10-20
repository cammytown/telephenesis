import cor from '../libs/minlab/cor';
import spc from '../libs/minlab/spc'; //// ultimately whatever spc becomes probably won't output a singleton

// import clientState from './components/ClientState';
import Star from '../../../abstract/Star.js';
import mediaPlayer from './MediaPlayer';

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

	function init(element = false) {
		Star.call(me);

		if(element) {
			me.element = element;
		} else {
			///REVISIT cleaner solution?:
			me.element = document.getElementById('placementSymbol').cloneNode(true); /// deep parameter in IE8??
		}

		me.linkElement = me.element.getElementsByTagName('a')[0];
		me.titleElement = me.element.getElementsByClassName('text title')[0];

		// Attach event listeners:
		me.linkElement.addEventListener('click', onClick);

		// Create identity properties:
		for (var propIndex = 0; propIndex < me.identityProps.length; propIndex++) {
			var property = me.identityProps[propIndex];
			me[property] = me.element.getAttribute('data-' + property);
		}

		// Add to DOM:
		spc.map.appendChild(me.element);
	}

	function onClick(event) {
		event.preventDefault();
		me.play();
	}

	me.play = function() {
		var starTitle = me.element.getAttribute('data-title');
		cor._('#playingStarTitle').innerHTML = starTitle;

		var creatorName = me.element.getAttribute('data-creatorName');
		cor._('#playingCreatorName').innerHTML = creatorName;

		var creatorLink = me.element.getAttribute('data-creatorLink');
		cor._('#playingCreatorLink').innerHTML = creatorLink;

		// cor._('#playingStarInfo').style.display = 'block';
		cor.ac(document.body, 'playing')

		mediaPlayer.playStar(me);
	}
}
