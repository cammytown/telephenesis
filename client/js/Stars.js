import cor from './libs/minlab/cor';
import spc from './libs/minlab/spc';
import anime from 'animejs/lib/anime.es.js';
// import Anm from './libs/minlab/anm';

import styleVars from '../scss/abstracts/_variables.scss';

import clientState from './ClientState';
import mediaPlayer from './MediaPlayer';
import effects from './ClientEffects';

export default new ClientStarsAPI();

function ClientStarsAPI() {
	var me = this;

	var starElements;

	me.cachedSorts = {
		'newest': null
	}

	this.init = function() {
		starElements = Array.from(document.getElementsByClassName('star')); ////TODO not supported in IE, make sure there's something to fill the gap

		for (var starIndex = 0; starIndex < starElements.length; starIndex++) {
			var starElement = starElements[starIndex];
			starElement.addEventListener('click', onClick);
		}

		styleVars.starGridWidth = parseInt(styleVars.starGridWidth); ///REVISIT architecture
		styleVars.starGridSize = parseInt(styleVars.starGridSize); ///REVISIT architecture
		styleVars.starGridPaddingX = parseInt(styleVars.starGridPaddingX); ///REVISIT architecture
		styleVars.starGridPaddingY = parseInt(styleVars.starGridPaddingY); ///REVISIT architecture
	}

	function onClick(event) {
		event.preventDefault();

		play(event.currentTarget);
		// if(state.path == path) return true;
	}

	this.sort = function(mode = "newest") { ///REVISIT maybe separate into its own component? probably rename when we better understand how we will architect things
		spc.s = false;

		var xOffset = -spc.x;
		var yOffset = -spc.y;

		// if(me.cachedSorts[mode] != null) {
		// 	////CHECK if there have been changes to the loaded stars, we cannot use cache

		// 	return true;
		// }

		// Rank stars according to mode
		switch(mode) {
			case 'newest': {
				// me.cachedSorts['newest'] = [];
				me.cachedSorts['newest'] = starElements.sort((a, b) => {
					return parseInt(b.getAttribute('data-timestamp'))
						- parseInt(a.getAttribute('data-timestamp'));
				});

				// for (var eleIndex = 0; eleIndex < starElements.length; eleIndex++) {
				// 	var starEle = starElements[eleIndex];
				// 	me.cachedSorts['newest']
				// }
			} break;
		}

		// Reposition each star
		var displayMode = 'grid';

		switch(displayMode) {
			// case 'constellationRows': {
			// 	var constellationOrder = [];

			// 	for (var starEleIndex = 0; starEleIndex < me.cachedSorts[mode].length; starEleIndex++) {
			// 		var starEle = me.cachedSorts[mode][starEleIndex];

			// 		// Calculate target position of the star
			// 		var newX = styleVars.starGridSize * starEleIndex;

			// 		var constellationID = starEle.getAttribute('data-constellation');
			// 		var constellationOrderIndex = constellationOrder.indexOf(constellationID);
			// 		if(constellationOrderIndex == -1) {
			// 			constellationOrderIndex = constellationOrder.length;
			// 			constellationOrder.push(constellationID);
			// 		}

			// 		var newY = constellationOrderIndex * styleVars.starGridSize;

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

			case 'grid': {
				var currentRow = 0;
				var rowCount = Math.floor(styleVars.starGridWidth / styleVars.starGridSize);

				for (var starEleIndex = 0; starEleIndex < me.cachedSorts[mode].length; starEleIndex++) {
					var starEle = me.cachedSorts[mode][starEleIndex];

					starEle.className = 'star ' + (starEleIndex % 2 ? 'odd' : 'even'); ///TODO don't just overwrite className

					// Calculate target position of the star
					var newX = styleVars.starGridSize * (starEleIndex % rowCount);
					var newY = styleVars.starGridSize * currentRow;

					// Animate the star to its target position
					anime({
						targets: starEle,
						left: newX + styleVars.starGridPaddingX + xOffset + 'px',
						top: newY + styleVars.starGridPaddingY + yOffset + 'px',
						duration: 500,
						complete: function() {
							me.generateConstellationLines();
							cor.ac(document.body, 'sorting'); ////
						}
					});

					// Wrap grid if row filled
					if(newX >= styleVars.starGridWidth - styleVars.starGridSize) {
						currentRow += 1;
					}
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

		if(starElement == clientState.playingStar) {
			mediaPlayer.audio.element.paused ? mediaPlayer.audio.play() : mediaPlayer.audio.pause();
		} else {
			if(clientState.playingStar) {
				cor.rc(clientState.playingStar, "active");
			}

			clientState.playingStar = starElement;
			cor.ac(starElement, "active");

			// var time = starElement.getElementsByTagName('span')[1];

			mediaPlayer.audio.load(starElement.getElementsByTagName('a')[0].href);
			// mediaPlayer.audio.load('/music/'+sid+'.mp3');

			mediaPlayer.audio.element.addEventListener('loadedmetadata', function() {
				mediaPlayer.audio.play();
			}, {
				once: true /// browser support?
			});
		}
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
	this.generateConstellationLines = function() {
		var lineDrawStartMS = performance.now();
		var queuedConstellationLines = [];

		// Loop through stars and queue an animated line draw.
		var starElements = document.getElementsByClassName('star');
		for (var starIndex = 0; starIndex < starElements.length; starIndex++) {
			var starElement = starElements[starIndex];
			if(starElement.getAttribute('data-prev')) {
				var originStarID = starElement.getAttribute('data-prev');

				if(parseInt(originStarID) != -1) { // If this is not an origin star
					var rootStar = document.getElementById('s' + originStarID);
					rootStar.setAttribute('data-next', starElement.id.split('s')[1]); ///TODO figure out what "next" means when there are multiple child stars; also this shouldn't be here if it were being used

					queuedConstellationLines.push({
						startX: parseInt(rootStar.style.left),
						startY: parseInt(rootStar.style.top),
						endX: parseInt(starElement.style.left),
						endY: parseInt(starElement.style.top),
						startColor: rootStar.getElementsByTagName('a')[0].style.backgroundColor, ///
						endColor: starElement.getElementsByTagName('a')[0].style.backgroundColor, ///
						tier: parseInt(starElement.getAttribute('data-tier'))
					});
				}
			}
		}

		window.requestAnimationFrame(drawLineStep);

		function drawLineStep(currentMS) {
			effects.context.clearRect(0, 0, effects.canvas.width, effects.canvas.height);

			var elapsedMS = currentMS - lineDrawStartMS;
			for (var lineIndex = 0; lineIndex < queuedConstellationLines.length; lineIndex++) {
				var line = queuedConstellationLines[lineIndex];

				////
				// var delay = (line.tier * 1000) - (line.tier * 350);
				var delay = ((line.tier) * 1000) - (line.tier * 800);
				// var delay = (line.tier * 1000) / (line.tier / 2);
				// var delay = ((line.tier * line.tier / 2) * 1000) - (line.tier * line.tier * 475);

				var progress = (elapsedMS - delay) / 1000;
				if(progress < 0) {
					continue;
				}

				if(progress >= 1) {
					progress = 1;
					// queuedConstellationLines.splice(queuedConstellationLines.indexOf(line), 1);
				}

				var lineVector = new spc.Vec2(line.endX - line.startX, line.endY - line.startY)
					// .normalize()
					.scale(progress);

				// console.log(lineVector);


				var drawVec = new spc.Vec2(line.startX + lineVector.x, line.startY + lineVector.y);

				// var lineGradient = effects.context.createLinearGradient(0,0,170,0);
				// var lineGradient = effects.context.createLinearGradient(line.startX,line.startY,line.endX,line.endY);
				// var lineGradient = effects.context.createLinearGradient(0, 0, line.endX + line.startX, line.endY + line.startY);
				var lineGradient = effects.context.createLinearGradient(
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
			// if(queuedConstellationLines.length) {
				window.requestAnimationFrame(drawLineStep); ////
			// }
		}
	}
}
