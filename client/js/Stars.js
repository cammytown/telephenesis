import cor from './libs/minlab/cor';

import clientState from './ClientState';
import effects from './ClientEffects';

export default new ClientStarsAPI();

function ClientStarsAPI() {
	this.init = function() {
		var starElements = document.getElementsByClassName('star');
		for (var starIndex = 0; starIndex < starElements.length; starIndex++) {
			var starElement = starElements[starIndex];
			starElement.addEventListener('click', onClick);
		}
	}

	function onClick(event) {
		event.preventDefault();

		play(event.currentTarget);
		// if(state.path == path) return true;
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
			clientState.audio.element.paused ? clientState.audio.play() : clientState.audio.pause();
		} else {
			if(clientState.playingStar) {
				cor.rc(clientState.playingStar, "active");
			}

			clientState.playingStar = starElement;
			cor.ac(starElement, "active");

			// var time = starElement.getElementsByTagName('span')[1];

			clientState.audio.load(starElement.getElementsByTagName('a')[0].href);
			// clientState.audio.load('/music/'+sid+'.mp3');

			clientState.audio.element.addEventListener('loadedmetadata', function() {
				clientState.audio.play();
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

	var lineDrawStartMS = performance.now();
	var queuedConstellationLines = [];
	this.generateConstellationLines = function() {
		/* stars */
		var starElements = document.getElementsByClassName('star');
		for (var starIndex = 0; starIndex < starElements.length; starIndex++) {
			var starElement = starElements[starIndex];
			if(starElement.getAttribute('data-prev')) {
				var originStarID = starElement.getAttribute('data-prev');
				if(parseInt(originStarID) > 0) {
					var rootStar = document.getElementById('s' + originStarID);
					rootStar.setAttribute('data-next', starElement.id.split('s')[1]);
					queuedConstellationLines.push({
						startX: parseInt(rootStar.style.left),
						startY: parseInt(rootStar.style.top),
						startColor: rootStar.getElementsByTagName('a')[0].style.backgroundColor, ///
						endX: parseInt(starElement.style.left),
						endY: parseInt(starElement.style.top),
						endColor: starElement.getElementsByTagName('a')[0].style.backgroundColor, ///
						tier: parseInt(starElement.getAttribute('data-tier'))
					});
				}
			}
		}

		window.requestAnimationFrame(drawLineStep);

		function drawLineStep(currentMS) {
			console.log(effects)
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

				// var lineGradient = canvasContext.createLinearGradient(0,0,170,0);
				// var lineGradient = canvasContext.createLinearGradient(line.startX,line.startY,line.endX,line.endY);
				// var lineGradient = canvasContext.createLinearGradient(0, 0, line.endX + line.startX, line.endY + line.startY);
				var lineGradient = canvasContext.createLinearGradient(line.startX + spc.x, line.startY + spc.y, drawVec.x + spc.x, drawVec.y + spc.y);
				lineGradient.addColorStop("0", line.startColor);
				lineGradient.addColorStop("1.0", line.endColor);

				// canvasContext.strokeStyle = 'rgb(200, 200, 200)';
				canvasContext.strokeStyle = lineGradient;
				canvasContext.beginPath();
				canvasContext.moveTo(line.startX + spc.x, line.startY + spc.y);
				canvasContext.lineTo(drawVec.x + spc.x, drawVec.y + spc.y);
				canvasContext.stroke();
			}

			/// optimize
			// if(queuedConstellationLines.length) {
				window.requestAnimationFrame(drawLineStep); ////
			// }
		}
	}
}
