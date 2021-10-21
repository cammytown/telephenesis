import cor from '../libs/minlab/cor';
import spc from '../libs/minlab/spc';
import anime from 'animejs/lib/anime.es.js';
// import Anm from './libs/minlab/anm';

import styleVars from '../../scss/abstracts/_variables.scss';

import clientState from './ClientState';
import effects from './ClientEffects';
import ClientStar from './ClientStar';

export default new ClientStarsAPI();

/**
 * Handles star sorting and physics.
 * @constructor
 **/
function ClientStarsAPI() {
	var me = this;

	var clientStars = [];

	var newPositions = {}; ///REVISIT naming

	/** Enforced margin between stars. **/
	var starSpacing = 50; ///REVISIT placement; in a central config file maybe?

	/** Array of start and end points for lines between stars. **/
	var constellationLines = [];

	/** Array of indices in constellationLines[] for lines which are not finished drawing. **/
	var animatingLines = [];

	var lineDrawStartMS; // When the constellation drawing animation began.

	// var isAnimating = false;

	me.cachedSorts = {
		'most-recent': null
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

			clientStars.push(new ClientStar(starElement));
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
		me.attemptPosition(newStar, newStar.position);
		clientStars.push(newStar);
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
	this.attemptPosition = function(targetStar, newPosition) { ///REVISIT naming/architecture
		////TODO this is currently a very dumb function, simply randomly checking for stars and
		//// moving directly away from any stars which are too close. This likely can lead to
		//// very inefficient loops where stars are constantly moving back and forth.
		//// Perhaps the answer is pick a point and push stars outward from there, like a ripple.

		// me.position = newPosition;
		// var movingStars = []; ///REVISIT architecture

		// if(newPositions[targetStar.id]) { ////DEBUGGING
		// 	return;
		// }

		newPositions[targetStar.id] = newPosition; ///REVISIT 
		// newPositions[targetStar.id] = newPosition;

		// for(var clientStar of clientStars) {
		for (var starIndex = 0; starIndex < clientStars.length; starIndex++) {
			var clientStar = clientStars[starIndex];

			if(clientStar.id == targetStar.id) { ///REVISIT best check?
				console.log('skipping self');
				continue;
			}

			var checkPosition = clientStar.position;

			// Check if we're already planning to move this star:
			if(newPositions.hasOwnProperty(clientStar.id)) {
				checkPosition = newPositions[clientStar.id];
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
		}

		///REVISIT should this wait until the root attemptPosition resolves?:
		// console.log('actualize ' + targetStar.id);
		// console.log(newPositions[targetStar.id]);
		targetStar.position = newPositions[targetStar.id];
		// for(var movingStar of movingStars) {
		// 	movingStar.position = newPositions[movingStar.id];
		// }
	}

	me.getSortedStars = function(order) {
		// if(me.cachedSorts[order] != null) {
		// 	////CHECK if there have been changes to the loaded stars, we cannot use cache
		// 	return true;
		// }

		// Rank stars according to order
		switch(order) {
			case 'most-recent': {
				// me.cachedSorts['most-recent'] = [];
				me.cachedSorts['most-recent'] = clientStars.sort((a, b) => {
					// If B is more recent than A, return true
					return parseInt(b.element.getAttribute('data-timestamp'))
						- parseInt(a.element.getAttribute('data-timestamp'));
				});

				return me.cachedSorts['most-recent'];
			} break;

			case 'most-popular': {
				return document.getElementsByClassName('star');
			} break;

			case 'bookmarks': {
				return document.getElementsByClassName('star bookmarked'); ///REVISIT optimize?
			} break;

			default: {
				console.error("Unhandled order mode: " + order);
			}
		}
	}

	this.sort = function(order, view) { ///REVISIT maybe separate into its own component? probably rename when we better understand how we will architect things
		// if(!view) view = "list"; // Explicit because we pass in the value of getAttribute('data-view')

		var xOffset = -spc.x;
		var yOffset = -spc.y;

		me.clearConstellationLines();

		// Reposition each star
		switch(view) {
			case 'galaxy': {
				spc.s = true;

				for (var starIndex = 0; starIndex < clientStars.length; starIndex++) {
					var starEle = clientStars[starIndex].element;

					cor.rc(document.body, 'sorting'); ////

					anime({
						targets: starEle,
						left: starEle.getAttribute('data-x') + 'px',
						top: starEle.getAttribute('data-y') + 'px',
						duration: 500,
						complete: function() {
							me.generateConstellationLines();
						}
					});
				}
			} break;

			case 'grid':
			case 'list': {
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
					if(view == 'grid') {
						newX = styleVars.starGridSquareSize * (starEleIndex % columnCount);
						newY = styleVars.starGridSquareSize * currentRow;
					} else if(view == 'list') {
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

					if(view == 'grid') {
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

	function remove(starElement) { /// revisit architecture
		var sid = clientState.actingStar.id.split('s')[1];
		var p = "sid="+sid;
		ajx('/ajax/deleteStar', p, function(d) {
			var r = JSON.parse(d);
			if(!r.error) {
				clientState.actingStar.fadeOut();
			}
		});

		return false;
	}

	function bookmark(starElement) {
		var sid = starElement.id.split('s')[1];
		var p = "sid="+sid;
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
	 * Draws constellation lines between stars.
	 */
	me.generateConstellationLines = function() {
		lineDrawStartMS = performance.now();
		constellationLines = [];
		animatingLines = [];
		// isAnimating = true;

		// Loop through stars and queue an animated line draw.
		var lineIndex = 0;
		for (var starIndex = 0; starIndex < clientStars.length; starIndex++) {
			var clientStar = clientStars[starIndex];
			var starElement = clientStar.element;

			if(starElement.getAttribute('data-prev')) {
				var originStarID = starElement.getAttribute('data-prev');

				if(parseInt(originStarID) != -1) { // If this is not an origin star
					var rootStar = document.getElementById('s' + originStarID);
					rootStar.setAttribute('data-next', starElement.id.split('s')[1]); ///TODO figure out what "next" means when there are multiple child stars; also this shouldn't be here if it were being used

					constellationLines.push({
						startX: parseInt(rootStar.style.left),
						startY: parseInt(rootStar.style.top),
						endX: clientStar.position.x,
						endY: clientStar.position.y,
						// endX: parseInt(starElement.style.left),
						// endY: parseInt(starElement.style.top),
						startColor: rootStar.getElementsByTagName('a')[0].style.backgroundColor, ///
						endColor: starElement.getElementsByTagName('a')[0].style.backgroundColor, ///
						tier: parseInt(starElement.getAttribute('data-tier')),
						isAnimating: true /// OPTIMIZATION?
					});

					animatingLines.push(lineIndex++);
				}
			}
		}

		window.requestAnimationFrame(me.drawLineStep);
	}

	me.drawLineStep = function(currentMS) {
		console.log("drawLineStep");

		effects.context.clearRect(0, 0, effects.canvas.width, effects.canvas.height);

		var elapsedMS = currentMS - lineDrawStartMS;
		// for (var animationIndex = 0; animationIndex < animatingLines.length; animationIndex++) {
			// var lineIndex = animatingLines[animationIndex];
		for (var lineIndex = 0; lineIndex < constellationLines.length; lineIndex++) {
			var line = constellationLines[lineIndex];

			var progress;
			if(line.isAnimating) {
				////
				// var delay = (line.tier * 1000) - (line.tier * 350);
				var delay = ((line.tier) * 1000) - ((line.tier * 800));
				// var delay = (line.tier * 1000) / (line.tier / 2);
				// var delay = ((line.tier * line.tier / 2) * 1000) - (line.tier * line.tier * 475);


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
		if(animatingLines.length) {
			window.requestAnimationFrame(me.drawLineStep); ////
		}
	}

	me.clearConstellationLines = function() {
		effects.context.clearRect(0, 0, effects.canvas.width, effects.canvas.height);
		constellationLines = [];
		animatingLines = [];
	}
}
