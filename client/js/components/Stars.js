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
	me.clientStars = [];

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

			var clientStar = new ClientStar(starElement);
			me.clientStars[clientStar.id] = clientStar;
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
		// me.attemptPosition(newStar, newStar.position);
		me.clientStars[newStar.id] =  newStar;
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

		// if(starMovements[targetStar.id]) { ////DEBUGGING
		// 	return;
		// }

		starMovements[targetStar.id] = newPosition; ///REVISIT 
		// starMovements[targetStar.id] = newPosition;

		// for(var clientStar of me.clientStars) {
		// for (var starIndex = 0; starIndex < me.clientStars.length; starIndex++) {
		// 	var clientStar = me.clientStars[starIndex];
		me.clientStars.forEach((clientStar, starIndex) => {
			if(clientStar.id == targetStar.id) { ///REVISIT best check?
				console.log('skipping self');
				return; //continue;
			}

			var checkPosition = clientStar.position;

			// Check if we're already planning to move this star:
			if(starMovements.hasOwnProperty(clientStar.id)) {
				checkPosition = starMovements[clientStar.id];
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
		// console.log('actualize ' + targetStar.id);
		// console.log(starMovements[targetStar.id]);
		targetStar.position = starMovements[targetStar.id];
		// for(var movingStar of movingStars) {
		// 	movingStar.position = starMovements[movingStar.id];
		// }
	}

	/**
	 * Retrieve sorted stars; either from cached results or a method.
	 * @param {CONSTANTS.ORDER} order
	 **/
	this.getSortedStars = function(order) {
		// if(me.cachedSorts[order] != null) {
		// 	////CHECK if there have been changes to the loaded stars, we cannot use cache
		// 	return true;
		// }

		// Rank stars according to order
		switch(order) {
			case CONSTS.ORDER.MOST_RECENT: {
				// me.cachedSorts['most-recent'] = [];
				me.cachedSorts[order] = me.clientStars.sort((a, b) => {
					// If B is more recent than A, return true
					return parseInt(b.element.getAttribute('data-timestamp'))
						- parseInt(a.element.getAttribute('data-timestamp'));
				}).map(star => star.element)
				.filter(starEle => starEle); ///REVISIT is this readable? removes starEle if falsey

				return me.cachedSorts[order];
			} break;

			case CONSTS.ORDER.MOST_POPULAR: {
				///REVISIT we rely on the server to have output the stars in popularity order.
				/// we should at the very least make this semantically clearer... or just leave a comment
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
	 * @param order {CONSTANTS.ORDER}
	 * @param view {CONSTANTS.VIEW}
	 **/
	this.sort = function(order, view) { ///REVISIT maybe separate into its own component? probably rename when we better understand how we will architect things
		// if(!view) view = "list"; // Explicit because we pass in the value of getAttribute('data-view')

		var xOffset = -spc.x;
		var yOffset = -spc.y;

		me.clearConstellationLines();

		// Reposition each star
		switch(view) {
			case CONSTS.VIEW.GALAXY: {
				spc.s = true;

				// for (var starIndex = 0; starIndex < me.clientStars.length; starIndex++) {
				// 	var starEle = me.clientStars[starIndex].element;
				me.clientStars.forEach((clientStar, starIndex) => {
					cor.rc(document.body, 'sorting'); ////

					anime({
						targets: clientStar.element,
						left: clientStar.element.getAttribute('data-x') + 'px',
						top: clientStar.element.getAttribute('data-y') + 'px',
						duration: 500,
						complete: function() {
							me.generateConstellationLines();
						}
					});
				});
			} break;

			case CONSTS.VIEW.GRID:
			case CONSTS.VIEW.LIST: {
				spc.s = false;

				var sortedElements = this.getSortedStars(order);

				///REVISIT these variables only used by grid view; sort of odd placed here:
				var currentRow = 0;
				var columnCount = Math.floor(styleVars.starGridWidth / styleVars.starGridSquareSize);

				for (var starEleIndex = 0; starEleIndex < sortedElements.length; starEleIndex++) {
					var starEle = sortedElements[starEleIndex];

					///REVISIT architecture:
					cor.rc(starEle, 'odd');
					cor.rc(starEle, 'even');
					cor.ac(starEle, starEleIndex % 2 ? 'odd' : 'even');

					// Calculate target position of the star
					var newX;
					var newY;
					if(view == CONSTS.VIEW.GRID) {
						newX = styleVars.starGridSquareSize * (starEleIndex % columnCount);
						newY = styleVars.starGridSquareSize * currentRow;
					} else if(view == CONSTS.VIEW.LIST) {
						newX = 0;
						newY = (styleVars.starGridSquareSize + styleVars.starGridMargin) * starEleIndex;
					}

					cor.ac(document.body, 'sorting'); ////

					// Animate the star to its target position
					anime({
						targets: starEle,
						left: newX + styleVars.starGridPaddingX + xOffset + 'px',
						top: newY + styleVars.starGridPaddingY + yOffset + 'px',
						duration: 500,
						complete: function() {
							me.generateConstellationLines();
						}
					});

					if(view == CONSTS.VIEW.GRID) {
						// Wrap grid if row filled
						if(newX >= styleVars.starGridWidth - styleVars.starGridSquareSize) {
							currentRow += 1;
						}
					}
				}
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
	}

	// function play(starElement) {
	// 	// var sid = starElement.id.split('s')[1];
	// 	// var sid = starElement.getAttribute('data-id').split('s')[1];

	// 	// var infoBox = cor._('#starInfoBox');
	// 	// infoBox.get

	// 	var starTitle = starElement.getAttribute('data-title');
	// 	cor._('#playingStarTitle').innerHTML = starTitle;

	// 	var creatorName = starElement.getAttribute('data-creatorName');
	// 	cor._('#playingCreatorName').innerHTML = creatorName;

	// 	var creatorLink = starElement.getAttribute('data-creatorLink');
	// 	cor._('#playingCreatorLink').innerHTML = creatorLink;

	// 	// cor._('#playingStarInfo').style.display = 'block';
	// 	cor.ac(document.body, 'playing')

	// 	mediaPlayer.playStar(starElement);
	// }

	function deleteStar(starElement) { ///REVISIT architecture; can't use delete name unless maybe this.delete because reserved word
		var starID = clientState.actingStar.id;
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
	 * Bookmark a star for the current user.
	 * @param {ClientStar} starElement - The star to bookmark.
	 **/
	function bookmark(starElement) {
		var starID = starElement.id;
		var p = "starID="+starID;
		ajx('/ajax/bookmark', p, function(d) {
			var r = JSON.parse(d);
			if(!r.error) {
				cor.ac(starElement, 'bookmarked');
				limbo.appendChild(starContextMenu);
			}
		});

		return false;
	}

	/**
	 * Prepare constellation lines for drawing.
	 **/
	this.generateConstellationLines = function() {
		lineDrawStartMS = performance.now();
		constellationLines = [];
		animatingLines = [];
		// isAnimating = true;

		// Loop through stars and queue an animated line draw.
		var lineIndex = 0;
		// for (var starIndex = 0; starIndex < me.clientStars.length; starIndex++) {
		// 	var clientStar = me.clientStars[starIndex];
		me.clientStars.forEach((clientStar, starIndex) => {
			var starElement = clientStar.element;

			if(clientStar.originStarID != -1) { // If this is not an origin star
				var rootStar = document.getElementById('s' + clientStar.originStarID);
				rootStar.setAttribute('data-next', clientStar.id); ///TODO figure out what "next" means when there are multiple child stars; also this shouldn't be here if it were being used

				// We use the star's style.left and .top in case we're in list/grid view:
				constellationLines.push({
					startX: parseInt(rootStar.style.left),
					startY: parseInt(rootStar.style.top),
					//endX: clientStar.position.x,
					//endY: clientStar.position.y,
					endX: parseInt(starElement.style.left),
					endY: parseInt(starElement.style.top),
					startColor: rootStar.getElementsByTagName('a')[0].style.backgroundColor, ///
					endColor: starElement.getElementsByTagName('a')[0].style.backgroundColor, ///
					tier: parseInt(starElement.getAttribute('data-tier')),
					isAnimating: true /// OPTIMIZATION?
				});

				animatingLines.push(lineIndex++);
			}
		});

		window.requestAnimationFrame(me.drawLineStep);
	}

	/**
	 * Draw a frame of the branching constellations.
	 * @param {number} currentMS
	 **/
	this.drawLineStep = function(currentMS) {
		console.log("drawLineStep");

		effects.context.clearRect(0, 0, effects.canvas.width, effects.canvas.height);

		var elapsedMS = currentMS - lineDrawStartMS;
		// for (var animationIndex = 0; animationIndex < animatingLines.length; animationIndex++) {
			// var lineIndex = animatingLines[animationIndex];
		for (var lineIndex = 0; lineIndex < constellationLines.length; lineIndex++) {
			var line = constellationLines[lineIndex];

			var progress;
			if(line.isAnimating) {
				// Slow down line drawing as it goes on:
				var delay = ((line.tier) * 1000) - ((line.tier * 800));

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
			if(!drawVec.x) {
				console.log(line);
				console.log(drawVec);
			}

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
		if(animatingLines.length) {
			window.requestAnimationFrame(me.drawLineStep); ////
		}
	}

	/**
	 * Clear the canvas of the constellation lines.
	 * @todo /// make it not just clear the whole canvas or rename this method
	 **/
	this.clearConstellationLines = function() {
		effects.context.clearRect(0, 0, effects.canvas.width, effects.canvas.height);
		constellationLines = [];
		animatingLines = [];
	}
}
