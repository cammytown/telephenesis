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

	//this.state = ;
	me.fileReady = false;
	me.isPlaced = false;


	function init(element = false) {
		Star.call(me);

		if(element) {
			me.element = element;

			///TODO I think we should have a more semantically-clear way of expressing that setting these to true is safe:
			/// for now, we just assume that if we're passing in an element, it's a completed star...
			me.fileReady = true;
			me.isPlaced = true;
		} else {
			///REVISIT cleaner solution?:
			me.element = document.getElementById('placementSymbol').cloneNode(true); /// deep parameter in IE8??
		}

		me.linkElement = me.element.getElementsByTagName('a')[0];
		me.titleElement = me.element.getElementsByClassName('text title')[0];

		// Attach event listeners:
		me.linkElement.addEventListener('click', onClick);

		// Create identity properties:
		me.observeAttributes();

		// Add to DOM:
		spc.map.appendChild(me.element);
	}

	function onClick(event) {
		event.preventDefault();

		///REVISIT me.isPlaced feels kinda hacky:
		if(me.isPlaced) {
			console.log(me.fileURL);
			me.play();
		} else {
			return false;
		}
	}

	/**
	 * Moves the star to a 2D coordinate.
	 * @param x {number}
	 * @param y {number}
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

	/**
	 * Play the media attached to the star.
	 */
	this.play = function() {
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

	/**
	 * Set properties according to HTML element attribute values.
	 **/
	this.observeAttributes = function() {
		// Function-scoped variable so we can use getter/setter with same name.
		var positionValue;

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

				case 'originStarID':
				case 'constellationID':
				case 'tier': {
					me[property] = parseInt(me.element.getAttribute('data-' + property));
				} break;

				default: {
					me[property] = me.element.getAttribute('data-' + property);
				}
			}
		}

		return true;
	}

	/**
	 * Set HTML element attributes according to property values.
	 **/
	this.observeProperties = function() {
		for(var propIndex = 0; propIndex < me.identityProps.length; propIndex++) {
			var property = me.identityProps[propIndex];

			switch(property) {
				case 'id': {
					me.element.id = 's' + me.id;
				} break;

				case 'position': {
					me.element.setAttribute('data-x', me.position.x);
					me.element.setAttribute('data-y', me.position.y);
				} break;

				case 'originStarID': {
					me.element.setAttribute('data-originStarID', me.originStarID);
					me.element.setAttribute('data-prev', me.originStarID);
				}

				case 'fileURL': {
					me.element.setAttribute('data-fileURL', me.fileURL);
					me.linkElement.href = me.fileURL;
				} break;

				default: {
					me.element.setAttribute('data-' + property, me[property]);
				}
			}
		}

		return true;
	}

	/**
	 * Convert identity properties to exportable data structure.
	 * @param dataType {string} - Type of data structure to return.
	 */
	this.export = function(dataType = "FormData") {
		switch(dataType) {
			case 'FormData': {
				var formData = new FormData();

				for (var propIndex = 0; propIndex < me.identityProps.length; propIndex++) {
					var identityProp = me.identityProps[propIndex];

					// If property is an object:
					if(me.objectProps.indexOf(identityProp) != -1) { ///probably keep array of which properties are objects in Star class
						formData.append(identityProp, JSON.stringify(me[identityProp]));

					// Property is a literal value; no need to stringify:
					} else {
						formData.append(identityProp, me[identityProp]);
					}
				}

				return formData;
			} break;

			default: {
				var error = "ClientStar.export(): Unhandled dataType '" + dataType + "'";
				console.error(error);
				throw new Error(error);
			}
		}
	}

	init(element);
}
