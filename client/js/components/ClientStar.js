import anime from 'animejs/lib/anime.es.js';
import cor from '../libs/minlab/cor';
import spc from '../libs/minlab/spc'; //// ultimately whatever spc becomes probably won't output a singleton

// import clientState from './components/ClientState';
import Star from '../../../abstract/Star.js';
import Vector from '../../../abstract/Vector.js';
import mediaPlayer from './MediaPlayer';

export default ClientStar;

/**
 * Star data structure for client use.
 * @param [element] {Element} - Optional pre-existing DOM element which holds the star and attributes.
 * @extends Star
 * @constructor
 */
function ClientStar(element) { ///REVISIT element not in use atm
	var me = this;

	// Inherits properties from Star.js ...

	///ARCHITECTURE:
	var currentAnimation = false;
	var animationLength = 200;
	var animationTimer;
	var animatingPosition;

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

		// Function-scoped variable so we can use getter/setter with same name.
		var positionValue;

		// Create identity properties:
		for (var propIndex = 0; propIndex < me.identityProps.length; propIndex++) {
			var property = me.identityProps[propIndex];

			switch(property) {
				case 'position': {
					Object.defineProperty(me, 'position', { ///REVISIT architecture
						get: function() {
							return positionValue;
						},
						set: function(newPos) {
							positionValue = newPos;
							me.element.style.left = newPos.x + 'px';
							me.element.style.top = newPos.y + 'px';
						},
						// configurable: true,
					});

					me.position = new Vector(
						parseInt(me.element.getAttribute('data-x')),
						parseInt(me.element.getAttribute('data-y')),
					);
					// console.log(me.position);
				} break;

				case 'id': {
					me.id = parseInt(me.element.id.split('s')[1]); ///ARCHITECTURE
				} break;

				default: {
					me[property] = me.element.getAttribute('data-' + property);
				}
			}
		}

		// Add to DOM:
		spc.map.appendChild(me.element);
	}

	function onClick(event) {
		event.preventDefault();
		me.play();
	}

	/**
	 * Moves the star to a 2D coordinate.
	 * @param x {int}
	 * @param y {int}
	 * @param animate {bool}
	 */
	this.moveToXY = function(x, y, animate = true) {
		var newPos = new Vector(x, y);
		if(!animate) {
			me.position = newPos;
		} else {
			animatingPosition = newPos;
			animationTimer = animationLength;

			if(!currentAnimation) {
				var animation = anime({
					/// move this block somewhere central:
					targets: me.element,
					left: () => { return animatingPosition.x + 'px' },
					top: () => { return animatingPosition.y + 'px' },
					duration: () => { return animationTimer },
					complete: () => {
						// Stars.generateConstellationLines();
						currentAnimation = false;
						this.moveToXY(x, y, false);
					}
				});

				return animation.finished;
			}
		}
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
