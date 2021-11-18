import anime from 'animejs/lib/anime.es.js';
import cor from '../libs/minlab/cor';
////REVISIT ultimately whatever spc becomes probably won't output a singleton:
import spc from '../libs/minlab/spc';

import Star from '../../../abstract/Star.js';
import Vector from '../../../abstract/Vector.js';
import MediaPlayer from './MediaPlayer';
import clientState from './ClientState';
import Navigation from './Navigation';
import Comments from './Comments';

export default ClientStar;

/**
 * Star data structure for client use.
 * @param [element] {Element} - Optional pre-existing DOM element which holds the star and attributes.
 * @extends Star
 * @constructor
 **/
function ClientStar(element) { ///REVISIT element not in use atm
	var me = this;

	// Inherits properties from Star.js ...

	///ARCHITECTURE:
	var currentAnimation = false;
	var animationLength = 200;
	var animationTimer;
	var animatingPosition;

	///ARCHITECTURE:
	this.element;
	this.linkElement;
	this.titleElement;
	this.dateElement;

	//this.state = ;
	this.fileReady = false;
	this.isPlaced = false;
	this.isBookmarked = false;

	function init(element = false) {
		Star.call(me);

		if(element) {
			me.element = element;

			///@TODO I think we should have a more semantically-clear way of
			//expressing that setting these to true is safe:
			///@REVISIT for now, we just assume that if we're passing in an element,
			//it's a completed star...
			me.fileReady = true;
			me.isPlaced = true;

			///REVISIT improve architecture?
			if(me.element.classList.contains('bookmarked')) {
				me.isBookmarked = true;
			}
		} else {
			///REVISIT cleaner solution?:
			/// deep parameter in IE8??
			me.element = document.getElementById('placementSymbol').cloneNode(true);
		}

		///REVISIT architecture
		me.linkElement = me.element.getElementsByTagName('a')[0];
		me.titleElement = me.element.getElementsByClassName('text title')[0];
		me.dateElement = me.element.getElementsByClassName('text creationTime')[0];

		// Attach event listeners:
		me.linkElement.addEventListener('mousedown', onMouseDown);
		me.linkElement.addEventListener('click', onClick);

		// Create identity properties:
		me.observeAttributes();

		// Add to DOM:
		spc.map.appendChild(me.element);
	}

	function onMouseDown(event) {
		// If user is placing this star, ignore mousedown to prevent dragging
		// star intead of space:
		if(!me.isPlaced) {
			event.preventDefault();
		}
	}

	function onClick(event) {
		event.preventDefault();

		///REVISIT me.isPlaced feels kinda hacky:
		if(me.isPlaced) {
			//me.play();
			Navigation.navigate("/star/" + me.id);
		} else {
			return false;
		}
	}

	/**
	 * Moves the star to a 2D coordinate over time.
	 * @param x {number}
	 * @param y {number}
	 * @param animate {bool}
	 */
	this.animateToXY = function(x, y) {
		var newPos = new Vector(x, y);

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
					me.position = newPos;
				}
			});

			return animation.finished;
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

		// cor._('#playingStarHeader').style.display = 'block';
		cor.ac(document.body, 'playing');

		var playingStarInputs = document.querySelectorAll('.playing-star-id');
		for(var playingStarInput of playingStarInputs) {
			playingStarInput.value = me.id;
		}

		Comments.loadStarComments(me);
		MediaPlayer.playStar(me);
	}

	/**
	 * Bookmarks the star for the client's user account.
	 **/
	this.bookmark = function() {
		return cor.POST('/ajax/bookmark', { starID: this.id })
			.then(response => response.json())
			.then(result => {
				if(result.errors) {
					throw result.errors;
				}

				cor.ac(this.element, 'bookmarked');
				me.isBookmarked = true;
				clientState.user.bookmarks.push(me);
				clientState.update();
			})
			.catch(err => {
				console.error(err);
				///TODO
			});
	}

	/**
	 * Removes bookmark from star for client's user account.
	 **/
	this.removeBookmark = function() {
		return cor.POST('/ajax/remove-bookmark', { starID: this.id })
			.then(response => response.json())
			.then(result => {
				if(result.errors) {
					throw result.errors;
				}

				this.element.classList.remove('bookmarked');
				me.isBookmarked = false;
				clientState.user.bookmarks.splice(clientState.user.bookmarks.indexOf(me), 1);
				clientState.update();
			})
			.catch(err => {
				console.error(err);
				///TODO
			});
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
					me.linkElement.href = '/star/' + me.id;
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
					//me.linkElement.href = me.fileURL;
				} break;

				case 'timestamp': {
					me.dateElement.innerText = new Date(me.timestamp).toLocaleDateString();
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

	/** Remove the ClientStar from the client. **/
	this.delete = function() {
		////TODO IE needs a polyfill; otherwise use removeChild:
		me.element.remove();
	}

	init(element);
}
