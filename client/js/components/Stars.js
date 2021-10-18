import cor from '../libs/minlab/cor';
import spc from '../libs/minlab/spc';
import anime from 'animejs/lib/anime.es.js';
// import Anm from './libs/minlab/anm';

import styleVars from '../../scss/abstracts/_variables.scss';

import clientState from './ClientState';
import mediaPlayer from './MediaPlayer';
import effects from './ClientEffects';

export default new ClientStarsAPI();

function ClientStarsAPI() {
	var me = this;

	var starElements;
	var constellationLines = []; // Array of start and end points for lines between stars.
	var animatingLines = []; // Array of indices in constellationLines[] for lines which are not finished drawing.
	var lineDrawStartMS; // When the constellation drawing animation began.

	var isAnimating = false;

	me.view = 'galaxy'; ///REVISIT architecture

	me.cachedSorts = {
		'most-recent': null
	}

	this.init = function() {
		starElements = Array.from(document.getElementsByClassName('star')); ////TODO not supported in IE, make sure there's something to fill the gap

		for (var starIndex = 0; starIndex < starElements.length; starIndex++) {
			var starElement = starElements[starIndex];
			starElement.addEventListener('click', onStarClick);
		}

		styleVars.starGridWidth = parseInt(styleVars.starGridWidth); ///REVISIT architecture
		styleVars.sortGridSquareSize = parseInt(styleVars.sortGridSquareSize); ///REVISIT architecture
		styleVars.starGridPaddingX = parseInt(styleVars.starGridPaddingX); ///REVISIT architecture
		styleVars.starGridPaddingY = parseInt(styleVars.starGridPaddingY); ///REVISIT architecture
	}

	function onStarClick(event) {
		event.preventDefault();

		play(event.currentTarget);
		// if(state.path == path) return true;
	}

	this.getSortedStars = function(order = "most-recent") {
		// Rank stars according to order
		switch(order) {
			case 'most-recent': {
				// me.cachedSorts['most-recent'] = [];
				me.cachedSorts['most-recent'] = starElements.sort((a, b) => {
					// If B is more recent than A, return true
					return parseInt(b.getAttribute('data-timestamp'))
						- parseInt(a.getAttribute('data-timestamp'));
				});

				// for (var eleIndex = 0; eleIndex < starElements.length; eleIndex++) {
				// 	var starEle = starElements[eleIndex];
				// 	me.cachedSorts['most-recent']
				// }
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

		return me.cachedSorts[order];
	}

	this.sort = function(order = "most-recent", view = "list") { ///REVISIT maybe separate into its own component? probably rename when we better understand how we will architect things
		if(!view) view = "list"; // Explicit because we pass in the value of getAttribute('data-view')

		var xOffset = -spc.x;
		var yOffset = -spc.y;

		// if(me.cachedSorts[order] != null) {
		// 	////CHECK if there have been changes to the loaded stars, we cannot use cache

		// 	return true;
		// }

		me.clearConstellationLines();

		///TODO probably move some of this into Interface.js:
		cor.rc(document.body, me.view); ////
		cor.ac(document.body, view); ////

		if(me.order) {
			cor.rc(document.body, me.order); ////
		}

		if(order) {
			cor.ac(document.body, order); ////
		}

		me.order = order;
		me.view = view;

		// Reposition each star
		switch(view) {
			// case 'constellationRows': {
			// 	var constellationOrder = [];

			// 	for (var starEleIndex = 0; starEleIndex < me.cachedSorts[order].length; starEleIndex++) {
			// 		var starEle = me.cachedSorts[order][starEleIndex];

			// 		// Calculate target position of the star
			// 		var newX = styleVars.sortGridSquareSize * starEleIndex;

			// 		var constellationID = starEle.getAttribute('data-constellation');
			// 		var constellationOrderIndex = constellationOrder.indexOf(constellationID);
			// 		if(constellationOrderIndex == -1) {
			// 			constellationOrderIndex = constellationOrder.length;
			// 			constellationOrder.push(constellationID);
			// 		}

			// 		var newY = constellationOrderIndex * styleVars.sortGridSquareSize;

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

			case 'galaxy': {
				spc.s = true;

				for (var starIndex = 0; starIndex < starElements.length; starIndex++) {
					var starEle = starElements[starIndex];

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

			case 'grid': {
				spc.s = false;

				var currentRow = 0;
				var rowCount = Math.floor(styleVars.starGridWidth / styleVars.sortGridSquareSize);

				var sortedElements = this.getSortedStars(order);
				for (var starEleIndex = 0; starEleIndex < sortedElements.length; starEleIndex++) {
					var starEle = sortedElements[starEleIndex];

					///REVISIT architecture:
					cor.rc(starEle, 'odd');
					cor.rc(starEle, 'even');
					cor.ac(starEle, starEleIndex % 2 ? 'odd' : 'even');

					// Calculate target position of the star
					var newX = styleVars.sortGridSquareSize * (starEleIndex % rowCount);
					var newY = styleVars.sortGridSquareSize * currentRow;

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

					// Wrap grid if row filled
					if(newX >= styleVars.starGridWidth - styleVars.sortGridSquareSize) {
						currentRow += 1;
					}
				}
			} break;

			case 'list': {
				spc.s = false;

				var sortedElements = this.getSortedStars(order);

				// var currentRow = 0;
				var rowMargin = 20;
				var rowCount = Math.floor(styleVars.starGridWidth / styleVars.sortGridSquareSize);

				var sortedElements = this.getSortedStars(order);
				for (var starEleIndex = 0; starEleIndex < sortedElements.length; starEleIndex++) {
					var starEle = sortedElements[starEleIndex];

					cor.rc(starEle, 'odd');
					cor.rc(starEle, 'even');
					cor.ac(starEle, starEleIndex % 2 ? 'odd' : 'even');

					// Calculate target position of the star
					var newX = 0;
					var newY = (styleVars.sortGridSquareSize + rowMargin) * starEleIndex;

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

					// Wrap grid if row filled
					// if(newX >= styleVars.starGridWidth - styleVars.sortGridSquareSize) {
					// 	currentRow += 1;
					// }
				}
			} break;
		}
	}

	function play(starElement) {
		// var sid = starElement.id.split('s')[1];
		// var sid = starElement.getAttribute('data-id').split('s')[1];

		// var infoBox = cor._('#starInfoBox');
		// infoBox.get

		var starTitle = starElement.getAttribute('data-title');
		cor._('#playingStarTitle').innerHTML = starTitle;

		var creatorName = starElement.getAttribute('data-creatorName');
		cor._('#playingCreatorName').innerHTML = creatorName;

		var creatorLink = starElement.getAttribute('data-creatorLink');
		cor._('#playingCreatorLink').innerHTML = creatorLink;

		// cor._('#playingStarInfo').style.display = 'block';
		cor.ac(document.body, 'playing')

		mediaPlayer.playStar(starElement);
	}

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
		isAnimating = true;

		// Loop through stars and queue an animated line draw.
		var starElements = document.getElementsByClassName('star');
		var lineIndex = 0;
		for (var starIndex = 0; starIndex < starElements.length; starIndex++) {
			var starElement = starElements[starIndex];
			if(starElement.getAttribute('data-prev')) {
				var originStarID = starElement.getAttribute('data-prev');

				if(parseInt(originStarID) != -1) { // If this is not an origin star
					var rootStar = document.getElementById('s' + originStarID);
					rootStar.setAttribute('data-next', starElement.id.split('s')[1]); ///TODO figure out what "next" means when there are multiple child stars; also this shouldn't be here if it were being used

					constellationLines.push({
						startX: parseInt(rootStar.style.left),
						startY: parseInt(rootStar.style.top),
						endX: parseInt(starElement.style.left),
						endY: parseInt(starElement.style.top),
						startColor: rootStar.getElementsByTagName('a')[0].style.backgroundColor, ///
						endColor: starElement.getElementsByTagName('a')[0].style.backgroundColor, ///
						tier: parseInt(starElement.getAttribute('data-tier'))
					});

					animatingLines.push(lineIndex++);
				}
			}
		}

		window.requestAnimationFrame(me.drawLineStep);
	}

	me.drawLineStep = function(currentMS) {
		effects.context.clearRect(0, 0, effects.canvas.width, effects.canvas.height);

		var elapsedMS = currentMS - lineDrawStartMS;
		// for (var animationIndex = 0; animationIndex < animatingLines.length; animationIndex++) {
			// var lineIndex = animatingLines[animationIndex];
		for (var lineIndex = 0; lineIndex < constellationLines.length; lineIndex++) {
			var line = constellationLines[lineIndex];

			var progress;
			if(isAnimating) {
				////
				// var delay = (line.tier * 1000) - (line.tier * 350);
				var delay = ((line.tier) * 1000) - (line.tier * 800);
				// var delay = (line.tier * 1000) / (line.tier / 2);
				// var delay = ((line.tier * line.tier / 2) * 1000) - (line.tier * line.tier * 475);

				progress = (elapsedMS - delay) / 1000;
				if(progress < 0) {
					continue;
				}

				if(progress >= 1) {
					progress = 1;
					animatingLines.splice(animatingLines.indexOf(lineIndex), 1);
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
		} else {
			isAnimating = false;
		}
	}

	me.clearConstellationLines = function() {
		effects.context.clearRect(0, 0, effects.canvas.width, effects.canvas.height);
		constellationLines = [];
		animatingLines = [];
	}
}
