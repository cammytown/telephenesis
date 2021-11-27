import cor from '../libs/minlab/cor';
import spc from '../libs/minlab/spc';
import anime from 'animejs/lib/anime.es.js';
// import Anm from './libs/minlab/anm';

import styleVars from '../../scss/abstracts/_variables.scss';

import clientState from './ClientState';
import effects from './ClientEffects';
import ClientStar from './ClientStar';
import CONSTS from '../../../abstract/constants.js';

export default new ClientStarsAPI();

/**
 * Handles star sorting and physics.
 * @constructor
 **/
function ClientStarsAPI() {
	var me = this;

	/** Active stars currently loaded on the client. **/
	me.clientStars = {};

	/** Enforced margin between stars. **/
	var starSpacing = 50; ///REVISIT placement; in a central config file maybe?

	/** Array of start and end points for lines between stars. **/
	var constellationLines = [];

	/** Array of indices in constellationLines[] for lines which are not finished drawing. **/
	var animatingLines = [];

	/** When the constellation drawing animation began. **/
	var lineDrawStartMS;

	/** Cached sort results of stars. **/
	this.cachedSorts = {
		'MOST_RECENT': null
	}

	this.init = function() {
		// Convert DOMList to Array for utility:
		///REVISIT I have no idea why we need to convert this to an actual array but trying to iterate over
		/// just getElementsByClassName() is not returning all of the elements and I just spent
		/// hours trying to figure out why and I'm losing my mind and I give up so:
		var starElements = Array.from(document.getElementsByClassName('star')); ////TODO not supported in IE, make sure there's something to fill the gap

		// var starElements = document.getElementsByClassName('star');
		// for (var starElement of document.getElementsByClassName('star')) {
		for (var starIndex = 0; starIndex < starElements.length; starIndex++) {
			var starElement = starElements[starIndex];

			// Skip placement symbol; not a real star:
			if(starElement.classList.contains('placementSymbol')) {
				continue;
			}

			// Load HTML element into a ClientStar:
			var clientStar = new ClientStar(starElement);
			me.clientStars[clientStar.publicID] = clientStar;
		}

		// Convert all styleVar properties to ints (from i.e. "20px" to 20)
		for(var property in styleVars) {
			styleVars[property] = parseInt(styleVars[property]);
		}
	}

	// function onStarClick(event) {
	// 	event.preventDefault();

	// 	play(event.currentTarget);
	// 	// if(state.path == path) return true;
	// }

	me.addStar = function(newStar) {
		if(!newStar.publicID) {
			throw "addStar(): no publicID on ClientStar";
		}

		// me.attemptPosition(newStar, newStar.position);
		me.clientStars[newStar.publicID] =  newStar;
	}

	// /**
	//  * Observe the placement or movement of a star and adjust positions if necessary.
	//  * @param observedStar {Star} - The star which has moved or been placed.
	//  */
	// this.observeStar = function(observedStar) { ///REVISIT naming; observeStarMovement?
	// 	// If star is too close:
	// 	var differenceVector = observedStar.position.subtract(me.position);
	// 	var starDistance = differenceVector.getMagnitude();

	// 	// If star is too close and adjustments must be made:
	// 	if(starDistance < starSpacing) {
	// 		const marginExcess = starSpacing - distance;

	// 		// Move observedStar away from this star:
	// 		var observedStarMovement = differenceVector.normalize().scale(marginExcess);
	// 		observedStar.attemptPosition(observedStar.position.add(observedStarMovement));

	// 		// Move this star away from observed star:
	// 		var starMovement = differenceVector.normalize.scale(-1 * marginExcess);
	// 		me.attemptPosition(me.position.add(starMovement));
	// 	}
	// }

	/**
	 * Attempt to move the star to a position, signaling nearby stars to also move if necessary.
	 * @param targetStar {ClientStar} - The star to move.
	 * @param newPosition {Vector} - Position to move the star to.
	 */
	var starMovements = {}; ///ARCHITECTURE
	this.attemptPosition = function(targetStar, newPosition) { ///REVISIT naming/architecture
		////TODO this is currently a very dumb function, simply randomly checking for stars and
		//// moving directly away from any stars which are too close. This likely can lead to
		//// very inefficient loops where stars are constantly moving back and forth.
		//// Perhaps the answer is pick a point and push stars outward from there, like a ripple.

		// me.position = newPosition;
		// var movingStars = []; ///REVISIT architecture

		// if(starMovements[targetStar.publicID]) { ////DEBUGGING
		// 	return;
		// }

		starMovements[targetStar.publicID] = newPosition; ///REVISIT
		// starMovements[targetStar.publicID] = newPosition;

		// for(var clientStar of me.clientStars) {
		// for (var starIndex = 0; starIndex < me.clientStars.length; starIndex++) {
		// 	var clientStar = me.clientStars[starIndex];
		Object.values(me.clientStars).forEach((clientStar, starIndex) => {
			if(clientStar.publicID == targetStar.publicID) { ///REVISIT best check?
				console.log('skipping self');
				return; //continue;
			}

			var checkPosition = clientStar.position;

			// Check if we're already planning to move this star:
			if(starMovements.hasOwnProperty(clientStar.publicID)) {
				checkPosition = starMovements[clientStar.publicID];
			}

			// Get distance between stars:
			var differenceVector = newPosition.subtract(checkPosition);
			var starDistance = differenceVector.getMagnitude();

			if(starDistance == 0) {
				console.log(targetStar);
				console.log(clientStar);
				throw "yeah okay";
			}

			// If star is too close and adjustments must be made:
			if(starDistance < starSpacing) {
				// console.log(differenceVector);
				const marginExcess = starSpacing - starDistance;

				// Move this clientStar away from targetStar:
				var clientStarMovement = differenceVector.normalize().scale(-1 * (marginExcess + 10)/2);
				me.attemptPosition(clientStar, checkPosition.add(clientStarMovement));

				// Move targetStar away from clientStar:
				var targetStarMovement = differenceVector.normalize().scale((marginExcess + 10)/2);
				me.attemptPosition(targetStar, newPosition.add(targetStarMovement));
			}
		});

		///REVISIT should this wait until the root attemptPosition resolves?:
		// console.log('actualize ' + targetStar.publicID);
		// console.log(starMovements[targetStar.publicID]);
		targetStar.position = starMovements[targetStar.publicID];
		// for(var movingStar of movingStars) {
		// 	movingStar.position = starMovements[movingStar.publicID];
		// }
	}

	/**
	 * Retrieve sorted stars; either from cached results or a method.
	 * @param {CONSTANTS.ORDER} order
	 **/
	this.getSortedStars = function(order) {
		///TODO enable cache:
		// if(me.cachedSorts[order] != null) {
		// 	////CHECK if there have been changes to the loaded stars, we cannot use cache
		// 	return true;
		// }

		// Rank stars according to order
		switch(order) {
			case CONSTS.ORDER.MOST_RECENT: {
				//me.cachedSorts[order] = [...me.clientStars] ///REVISIT not working

				// // Make a copy of the array:
				//me.cachedSorts[order] = me.clientStars.slice()

				// Convert clientStars object to array:
				me.cachedSorts[order] = Object.values(me.clientStars)
					// Sort by newest:
					.sort((a, b) => {
						// If B is more recent than A, return true
						return parseInt(b.element.getAttribute('data-timestamp'))
							- parseInt(a.element.getAttribute('data-timestamp'));

					// Abandon star object and just store it's element:
					}).map(star => star.element)

					// Remove null/false elements:
					.filter(starEle => starEle); ///REVISIT is this readable?

				return me.cachedSorts[order];
			} break;

			case CONSTS.ORDER.CONSTELLATIONS: {
				var constellations = {};


				Object.values(me.clientStars).forEach(star => {
					if(!constellations[star.constellationID]) {
						constellations[star.constellationID] = [];
					}

					constellations[star.constellationID].push(star);
				});

				Object.keys(constellations).forEach(constellationID => {
					///REVISIT if we return from server and order elements in
					//sequence of ID, this should be unnecessary:
					var sortedConstellation = constellations[constellationID]
						//@REVISIT redundancy:
						.sort((a, b) => {
							return a.timestamp - b.timestamp;
						})
						.map(star => star.element)
						.filter(starEle => starEle);

					constellations[constellationID] = sortedConstellation;
				})

				///REVISIT should we be concerned that this order returns a
				//different data structure than others?:
				me.cachedSorts[order] = constellations

				return me.cachedSorts[order];
			} break;

			case CONSTS.ORDER.MOST_POPULAR: {
				//TODO-2 we rely on the server to have output the stars in
				//popularity order. Just a quick-fix.
				return document.getElementsByClassName('star');
			} break;

			case CONSTS.ORDER.BOOKMARKS: {
				return document.getElementsByClassName('star bookmarked'); ///REVISIT optimize?
			} break;

			default: {
				console.error("Unhandled order mode: " + order);
			}
		}
	}

	/**
	 * Sort the stars by order and display them according to view.
	 * @param {CONSTANTS.ORDER} order
	 * @param {CONSTANTS.VIEW} view
	 **/
	this.sort = function(order, view) { ///REVISIT maybe separate into its own component? probably rename when we better understand how we will architect things
		// if(!view) view = "list"; // Explicit because we pass in the value of getAttribute('data-view')
		//me.clearConstellationLines();

		// Reposition each star
		switch(view) {
			case CONSTS.VIEW.GALAXY: {
				spc.s = true;

				// for (var starIndex = 0; starIndex < me.clientStars.length; starIndex++) {
				// 	var starEle = me.clientStars[starIndex].element;
				Object.values(me.clientStars).forEach((clientStar, starIndex) => {
					cor.rc(document.body, 'sorting'); ////

					anime({
						targets: clientStar.element,
						left: clientStar.position.x + 'px',
						top: clientStar.position.y + 'px',
						///TODO move 500 into maybe styleVars or at least a const
						duration: 500,
						update: (anim) => me.updateConstellationLines()
						//complete: function() {}
					});

					// Set the dimensions of the canvas to that of the window:
					effects.canvas.width = document.body.offsetWidth;
					effects.canvas.height = document.body.offsetHeight;
				});
			} break;

			case CONSTS.VIEW.CONSTELLATIONS: {
				spc.s = false;

				//@REVISIT kinda weird:
				var sortedElements = this.getSortedStars(order);

				var currentRow = 0;
				for(var constellationID in sortedElements) {
					var constellationStars = sortedElements[constellationID];

					positionLoop(constellationStars, (starIndex => {
						const x = starIndex * styleVars.starGridSquareSize;
						const y = currentRow * styleVars.starGridSquareSize;

						return { x, y };
					}));

					currentRow += 1;
				}

				cor.ac(document.body, 'sorting');
			} break;

			case CONSTS.VIEW.GRID: {
				spc.s = false;
				var sortedElements = this.getSortedStars(order);

				var currentRow = 0;
				var columnCount = Math.floor(styleVars.starGridWidth / styleVars.starGridSquareSize);
				positionLoop(sortedElements, (starIndex => {
					// Calculate target position of the star
					const x = styleVars.starGridSquareSize * (starEleIndex % columnCount);
					const y = styleVars.starGridSquareSize * currentRow;

					// Wrap grid if row filled
					if(newX >= styleVars.starGridWidth - styleVars.starGridSquareSize) {
						currentRow += 1;
					}

					return { x, y };
				}));

				cor.ac(document.body, 'sorting');
			} break;

			case CONSTS.VIEW.LIST: {
				spc.s = false;
				var sortedElements = this.getSortedStars(order);

				positionLoop(sortedElements, (starIndex => {
					// Calculate target position of the star
					const x = 0;
					const y = (styleVars.starGridSquareSize + styleVars.starGridMargin) * starIndex;

					return { x, y };
				}));

				cor.ac(document.body, 'sorting'); ////

			} break;

			// case 'constellationRows': {
			// 	var constellationOrder = [];

			// 	for (var starEleIndex = 0; starEleIndex < me.cachedSorts[order].length; starEleIndex++) {
			// 		var starEle = me.cachedSorts[order][starEleIndex];

			// 		// Calculate target position of the star
			// 		var newX = styleVars.starGridSquareSize * starEleIndex;

			// 		var constellationID = starEle.getAttribute('data-constellation');
			// 		var constellationOrderIndex = constellationOrder.indexOf(constellationID);
			// 		if(constellationOrderIndex == -1) {
			// 			constellationOrderIndex = constellationOrder.length;
			// 			constellationOrder.push(constellationID);
			// 		}

			// 		var newY = constellationOrderIndex * styleVars.starGridSquareSize;

			// 		// Animate the star to its target position
			// 		anime({
			// 			targets: starEle,
			// 			left: xPadding + newX + 'px',
			// 			top: newY + 'px',
			// 			duration: 2000,
			// 			complete: this.generateConstellationLines
			// 		});
			// 	}
			// } break;

			default: {
				console.error("Unhandled star view: " + view);
			}
		}

		// Redraw constellation lines:
		//@REVISIT are we good to just use time of animation + 100ms here?:
		setTimeout(function() {
			effects.onResize();
			//me.generateConstellationLines();
			me.updateConstellationLines();
		}, 600);
	}

	//@REVISIT naming:
	function positionLoop(starEles, positionCallback) {
		var spcXOffset = -spc.x;
		var spcYOffset = -spc.y;

		// Get origin x based on where CSS has placed layout element:
		//@TODO revisit this architecture
		var originX = document.querySelector('#sorting-header')
			.offsetLeft + styleVars.starSize;

		for (var starEleIndex = 0; starEleIndex < starEles.length; starEleIndex++) {
			var starEle = starEles[starEleIndex];

			///REVISIT architecture:
			cor.rc(starEle, 'odd');
			cor.rc(starEle, 'even');
			cor.ac(starEle, starEleIndex % 2 ? 'odd' : 'even');

			var position = positionCallback(starEleIndex);

			// Animate the star to its target position
			anime({
				targets: starEle,
				left: position.x + originX + spcXOffset + 'px',
				top: position.y + styleVars.starGridPaddingY + spcYOffset + 'px',
				duration: 500,
				update: (anim) => me.updateConstellationLines()
			});
		}
	}

	function deleteStar(starElement) {
		var starID = clientState.actingStar.publicID;
		var p = "starID="+starID;
		ajx('/ajax/deleteStar', p, function(d) {
			var r = JSON.parse(d);
			if(!r.error) {
				clientState.actingStar.element.fadeOut();
			}
		});

		return false;
	}

	/**
	 * Prepare constellation lines for drawing.
	 **/
	//this.generateConstellationLines = function(animating = true) {
	this.generateConstellationLines = function() {
		//if(animating) {
			lineDrawStartMS = performance.now();
		//}

		constellationLines = [];
		animatingLines = [];
		// isAnimating = true;

		// Loop through stars and queue an animated line draw.
		var lineIndex = 0;
		// for (var starIndex = 0; starIndex < me.clientStars.length; starIndex++) {
		// 	var clientStar = me.clientStars[starIndex];
		Object.values(me.clientStars).forEach((clientStar, starIndex) => {
			var starEle = clientStar.element;

			if(clientStar.originStarID != -1) { // If this is not an origin star
				var originStarEle = document.getElementById('star_' + clientStar.originStarID);
				if(!originStarEle) {
					console.error('root star not loaded for ' + clientStar.publicID);
					throw false;
				}

				originStarEle.setAttribute('data-next', clientStar.publicID); ///TODO figure out what "next" means when there are multiple child stars; also this shouldn't be here if it were being used

				// We use the star's style.left and .top in case we're in list/grid view:
				constellationLines.push({
					starEle,
					originStarEle,
					startX: parseInt(originStarEle.style.left),
					startY: parseInt(originStarEle.style.top),
					//endX: clientStar.position.x,
					//endY: clientStar.position.y,
					endX: parseInt(starEle.style.left),
					endY: parseInt(starEle.style.top),
					startColor: originStarEle.getElementsByTagName('a')[0].style.backgroundColor, ///
					endColor: starEle.getElementsByTagName('a')[0].style.backgroundColor, ///
					tier: parseInt(starEle.getAttribute('data-tier')),
					isAnimating: true /// OPTIMIZATION?
				});

				animatingLines.push(lineIndex++);
			}
		});

		me.drawLineStep();
	}

	/**
	 * Update the start and end positions of constellation lines.
	 **/
	this.updateConstellationLines = function() {
		constellationLines.forEach(line => {
			line.startX = parseInt(line.originStarEle.style.left);
			line.startY = parseInt(line.originStarEle.style.top);
			line.endX = parseInt(line.starEle.style.left);
			line.endY = parseInt(line.starEle.style.top);
		});

		return me.drawLineStep();
		//window.requestAnimationFrame(me.drawLineStep);
	}

	/**
	 * Draw a frame of the branching constellations.
	 * @param {number} currentMS
	 * @todo Rename, probably.
	 **/
	this.drawLineStep = function(currentMS = performance.now(), animating = true) {

		effects.context.clearRect(0, 0, effects.canvas.width, effects.canvas.height);

		var elapsedMS = currentMS - lineDrawStartMS;
		// for (var animationIndex = 0; animationIndex < animatingLines.length; animationIndex++) {
			// var lineIndex = animatingLines[animationIndex];
		for (var lineIndex = 0; lineIndex < constellationLines.length; lineIndex++) {
			var line = constellationLines[lineIndex];

			var progress;
			if(line.isAnimating) {
				// Slow down line drawing as it goes on:
				var delay = ((line.tier - 1) * 1000) - ((line.tier - 1) * 915);
				//var delay = (line.tier * 1000) / (line.tier + 1);

				// var delay = (line.tier - 1) * 1000;

				progress = (elapsedMS - delay) / 1000;
				if(progress < 0) {
					continue;
				}

				if(progress >= 1) {
					progress = 1;

					// Line fully drawn; remove line from animatingLines:
					animatingLines.splice(animatingLines.indexOf(lineIndex), 1);
					line.isAnimating = false;
					// Reduce lineIndex now that animatingLines has been spliced:
					lineIndex -= 1;
				}
			} else {
				progress = 1;
			}

			var lineVector = new spc.Vec2(line.endX - line.startX, line.endY - line.startY)
				.scale(progress);

			var drawVec = new spc.Vec2(line.startX + lineVector.x, line.startY + lineVector.y);

			// var lineGradient = effects.context.createLinearGradient(0,0,170,0);
			// var lineGradient = effects.context.createLinearGradient(line.startX,line.startY,line.endX,line.endY);
			// var lineGradient = effects.context.createLinearGradient(0, 0, line.endX + line.startX, line.endY + line.startY);

			var lineGradient = effects.context.createLinearGradient( ///TODO maybe save this with the line? or the data involved?
				line.startX + spc.x,
				line.startY + spc.y,
				drawVec.x + spc.x,
				drawVec.y + spc.y
			);

			lineGradient.addColorStop("0", line.startColor);
			lineGradient.addColorStop("1.0", line.endColor);

			// effects.context.strokeStyle = 'rgb(200, 200, 200)';
			effects.context.strokeStyle = lineGradient;
			effects.context.beginPath();
			effects.context.moveTo(line.startX + spc.x, line.startY + spc.y);
			effects.context.lineTo(drawVec.x + spc.x, drawVec.y + spc.y);
			effects.context.stroke();
		}

		/// optimize
		if(animatingLines.length && animating) {
			return window.requestAnimationFrame(me.drawLineStep); ////
		}
	}

	/**
	 * Clear the cache and canvas of the constellation lines.
	 * @todo /// make it not just clear the whole canvas or rename this method
	 **/
	this.clearConstellationLines = function() {
		effects.context.clearRect(0, 0, effects.canvas.width, effects.canvas.height);
		constellationLines = [];
		animatingLines = [];
	}
}
