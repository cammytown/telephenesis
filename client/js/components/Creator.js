import cor from '../libs/minlab/cor';
import spc from '../libs/minlab/spc'; //// ultimately whatever spc becomes probably won't output a singleton
import Anm from '../libs/minlab/anm';
import Upl from '../libs/minlab/upl';
import ColorTool from '../libs/minlab/colorTool.js';
// import ajx from '../libs/minlab/ajx'; ///TODO get rid of in favor or Pijin
// import HistoryTime from '../libs/history-time';

import navigation from './Navigation';
import clientState from './ClientState.js';
import ClientStar from './ClientStar.js';
import Stars from './Stars.js';
import Interface from './Interface.js';

import Vector from '../../../abstract/Vector.js';
import * as CONSTS from '../../../abstract/constants.js';

export default new Creator();

/**
 * Class used for creating new stars on the client.
 * @constructor
 **/
function Creator() {

	/**
	 * The star that the user is creating.
	 * @type ClientStar
	 **/
	var workingStar;

	/**
	 * The originStar of the star the user is creating.
	 * @type ClientStar
	 **/
	///REVISIT should we just keep this in workingStar.originStar?
	var workingOriginStar;

	/**
	 * The creation step the user is on.
	 * @type { false | "place" | "color" }
	 **/
	var currentStep;

	var validPlacementZone;
	//var accessSettingInput;
	//var publicGameButton;
	//var privateGameButton;

	/** @type {Vector2} **/
	var mouseDownPos;

	/** The color wheel used for coloring genesis stars. **/
	var colorwheelSelect;

	this.init = function() {
		// accessSettingInput = cor._('#accessSetting')
		// publicGameButton = cor._('#publicGameButton');
		// privateGameButton = cor._('#privateGameButton');

		// publicGameButton.addEventListener('click', onPublicGameButtonClick);
		// privateGameButton.addEventListener('click', onPrivateGameButtonClick);

		cor._('#create-page').addEventListener('submit', onCreateSubmit);
		cor._('#recreate-page').addEventListener('submit', onCreateSubmit);
		///REVISIT removed because we're only doing links atm:
		// cor._('#submission').addEventListener('change', uploadCreation);

		for(var recreateLink of cor._('.createStar')) {
			recreateLink.addEventListener('click', onCreateStarClick);
		}

		for(var recreateLink of cor._('.recreateStar')) {
			recreateLink.addEventListener('click', onRecreateStarClick);
		}

		validPlacementZone = document.getElementById('validPlacementZone');
		validPlacementZone.style.display = 'none';
		spc.map.appendChild(validPlacementZone);

		colorwheelSelect = document.getElementById('colorwheelSelect');

		cor.al(colorwheelSelect, 'mousemove', getColorFromWheelPosition);
		cor.al(colorwheelSelect, 'click', function() {
			cor.rl(colorwheelSelect, 'mousemove', getColorFromWheelPosition);

			workingStar.color = workingStar.linkElement.style.backgroundColor.substr(4).slice(0, -1); /// bad code / maybe unreliable
			Anm.fadeOut(colorwheelSelect);

			workingStar.isPlaced = true;
			actualizeCreation();

			// if(!workingStar.isUploaded) {
			// 	workingStar.isPlaced = true;
			// } else {
			// 	actualizeCreation();
			// }
		});
	}

	/** Cancel creation process. **/
	this.cancel = function() {
		workingStar.delete();
		Interface.hideMessage();
		endCreationStep();
	}

	function onCreateStarClick(event) {
		event.preventDefault();

		navigation.navigate(event.target.pathname);
	}

	function onRecreateStarClick(event) {
		event.preventDefault();

		navigation.navigate(event.target.pathname
			+ '/' + clientState.actingStar.id);
	}

	/**
	 * Begin star creation process.
	 * @param {ClientStar | false} originStar
	 **/
	this.initializeCreation = function(originStar = false) {
		workingStar = new ClientStar();

		workingStar.element.style.display = 'none';
		workingStar.id = "placeholder"; ///REVISIT architecture
		workingStar.originStarID = originStar ? originStar.id : -1;
		workingStar.tier = originStar ? originStar.tier + 1 : 0;

		if(originStar) {
			workingOriginStar = originStar;
		}
	}

	function onCreateSubmit(event) {
		// starting a new constellation

		event.preventDefault();

		var formEle = event.target;

		workingStar.hostType = 'external'; ////
		workingStar.title = formEle.getElementsByClassName('star-title')[0].value;
		workingStar.fileURL = formEle.getElementsByClassName('file-url')[0].value;
		workingStar.element.style.display = null; ///REVISIT best method?
		//workingStar.title = cor._('#genesis-star-title').value;
		//workingStar.fileURL = cor._('#genesis-file-url').value;

		if(workingStar.hostType == 'upload') {
			////REVISIT
			// uploadCreation();
		} else {
			////TODO validate the file

			workingStar.fileReady = true;

			initializePlacement();
		}

	}

	// function onRecreateSubmit(event) {
	// 	initializePlacement(false);
	// }

	// function onPublicGameButtonClick(event) {
	// 	// cor._('#privateGameSelect');
	// 	accessSetting.value = 'public';
	// 	cor.ac(publicGameButton, 'active');
	// 	cor.rc(privateGameButton, 'active');
	// 	var timeSettingsEl = cor._('#timeSettings');
	// 	cor.ac(timeSettingsEl, 'public');
	// 	cor.rc(timeSettingsEl, 'private');
	// }

	// function onPrivateGameButtonClick(event) {
	// 	accessSetting.value = 'private';
	// 	cor.ac(privateGameButton, 'active');
	// 	cor.rc(publicGameButton, 'active');
	// 	var timeSettingsEl = cor._('#timeSettings');
	// 	cor.ac(timeSettingsEl, 'private');
	// 	cor.rc(timeSettingsEl, 'public');
	// }

	///REVISIT maybe rename this to be more specific to event handling since
	//that's currently all it does:
	function endCreationStep() {
		switch(currentStep) {
			case 'place': {
				if(workingStar.originStarID == -1) { // Is a constellation genesis star.
					spc.element.removeEventListener('mousemove', moveWorkingStarToMouse);
					spc.element.removeEventListener('mouseup', onPlacementMouseUp);
				} else {
					validPlacementZone.removeEventListener('mousemove', moveWorkingStarToMouse);
					validPlacementZone.removeEventListener('mouseup', onPlacementMouseUp);
				}
			} break;

			case 'color': {
			} break;

			default: {
				console.error("Unhandled creation step: " + currentStep);
			}
		}

		currentStep = false;
	}

	function initializePlacement() {
		currentStep = 'place';

		// close the creation UI
		///REVISIT uris /create/place doesn't work with our thrown-together uri system
		navigation.navigate('place');

		///TODO probably replace 'notification' message type with something
		//like 'createInstruction' or something and have it appear differently
		//(more prominently):
		if(workingStar.originStarID == -1) {
			Interface.displayMessage("Choose a spot for your star!", 'notification', 0);

			// User can place star anywhere in the galaxy:
			spc.element.addEventListener('mousemove', moveWorkingStarToMouse);
			spc.element.addEventListener('mousedown', onPlacementMouseDown);
			spc.element.addEventListener('mouseup', onPlacementMouseUp);

		} else {
			Interface.displayMessage("Choose a spot for your star near the one you recreated!", 'notification', 0);

			// Create valid placement zone around the area of the origin star:
			var current_x = workingOriginStar.position.x;
			var current_y = workingOriginStar.position.y;

			validPlacementZone.style.left = current_x - 77 + 'px';
			validPlacementZone.style.top = current_y - 73 + 'px';
			validPlacementZone.style.display = 'block';

			cor.al(validPlacementZone, 'mousemove', moveWorkingStarToMouse);
			validPlacementZone.addEventListener('mousedown', onPlacementMouseDown);
			validPlacementZone.addEventListener('mouseup', onPlacementMouseUp);

			// Center camera around origin star:
			spc.ctr(current_x, current_y);
		}

	}

	function moveWorkingStarToMouse(event) {
		workingStar.moveToXY(
			event.clientX - spc.map.offsetLeft,
			event.clientY - spc.map.offsetTop
		);

		return true;
	}

	function onPlacementMouseDown(event) {
		//event.preventDefault();
		mouseDownPos = new Vector(event.clientX, event.clientY);

		return true;
	}

	function onPlacementMouseUp(event) {
		var mouseUpPos = new Vector(event.clientX, event.clientY);
		var differenceVector = mouseDownPos.subtract(mouseUpPos);

		// Calculate how far the mouse has been dragged:
		var distance = differenceVector.getMagnitude();

		// If the drag distance is negligible, treat as a click:
		if(distance < 5) {
			workingStarClick(event);
		}

		return true;
	}

	function workingStarClick(event) {
		// User has selected the position for their star.

		// workingStar.moveToXY( ///REVISIT do we need to have this code both here and in moveWorkingStarToMouse?
		// 	event.clientX - spc.map.offsetLeft,
		// 	event.clientY - spc.map.offsetTop
		// );

		// Stars.addStar(workingStar);

		// spc.ctr(workingStar.position.x, workingStar.position.y); /// create callback function for ctr? currently using validPlacementZone fadeOut delay

		endCreationStep();

		initializeColoring();
	}

	function initializeColoring() {
		///TODO prevent movement??

		currentStep = 'color';

		if(workingStar.originStarID == -1) {
			Interface.displayMessage("Choose a color for your star.", 'notification', 0);

			workingStar.element.appendChild(colorwheelSelect);
			Anm.fadeIn(colorwheelSelect);
		} else {
			Interface.displayMessage("Choose a color for your star. You can only shift the color slightly "
				+ "from the star you recreated!", 'notification', 0);

			// Coloring a constellation star; only hues adjacent to origin star are allowed.

			Anm.fadeOut(validPlacementZone);

			///REVISIT at least document with comments if not refactor:

			var colorShiftSelect = document.getElementById('colorShiftSelect');
			var rgb = workingOriginStar.linkElement.style.backgroundColor.substr(4).split(',');
			var hsl = ColorTool.rgb(rgb[0], rgb[1], parseInt(rgb[2]));
			colorShiftSelect.children[0].style.background = 'hsl('+(hsl[0]-17)+', 45%, 80%)';
			colorShiftSelect.children[1].style.background = 'hsl('+(hsl[0]+17)+', 45%, 80%)';
			workingStar.element.appendChild(colorShiftSelect);

			Anm.fadeIn(colorShiftSelect, 250, function() {
				cor.al(colorShiftSelect, 'mouseover', function(e) {
					workingStar.linkElement.style.background = e.target.style.background;
				});

				cor.al(colorShiftSelect, 'click', function(e) { // (finish)
					workingStar.color = e.target.style.backgroundColor.substr(4).slice(0, -1);
					workingStar.linkElement.style.background = e.target.style.background;

					Anm.fadeOut(colorShiftSelect, 300, function() {
						colorShiftSelect.parentNode.removeChild(colorShiftSelect);
					});

					limbo.appendChild(validPlacementZone);

					// document.body.removeAttribute('class');
					// spc.on = true;
					workingStar.isPlaced = true;
					actualizeCreation();

					// if(!workingStar.isUploaded) {
					// 	workingStar.isPlaced = true;
					// 	Anm.fadeOut(colorShiftSelect);
					// 	// console.log(workingStar.color);
					// } else {
					// 	actualizeCreation()
					// }
				});
			});
		}

		// 	guide.innerHTML = "Now choose a color. You can only shift the color 11 degrees from the previous star.";
	}

	// coloring a genesis star; any color is allowed
	function getColorFromWheelPosition(e) {
		var cx = -(workingStar.position.x + (spc.map.offsetLeft - e.clientX)); ///TODO + half star width, I think? same for below with height?
		var cy = (workingStar.position.y + (spc.map.offsetTop - e.clientY));

		var angle = -Math.atan2(cy, cx) * 180 / Math.PI + 180;

		var selectedhue;

		if(angle>0 && angle<60) selectedhue = 110;
		else if(angle>60 && angle<120) selectedhue = 60;
		else if(angle>120 && angle<180) selectedhue = 25;
		else if(angle>180 && angle<240) selectedhue = 0;
		else if(angle>240 && angle<300) selectedhue = 270;
		else if(angle>300) selectedhue = 240;

		workingStar.linkElement.style.backgroundColor = 'hsl('+selectedhue+', 45%, 80%)';
	}

	function uploadCreation() {
		/// create back and forth navigation
		/// could use some attention

		// state.updating = false;
		navigation.navigate('/');
		// document.body.className = null;
		//spc.ctr(0, 0);

		var originStarID = workingOriginStar ? workingOriginStar.id : -1;
		var file = document.getElementById('submission');
		var upl = new Upl('/ajax/upload/'+originStarID, file, onUploadProgress, onUploadComplete);

		initializePlacement();

		function onUploadProgress(e) {
			if (e.lengthComputable) {
				var progress = e.loaded / e.total;
				workingStar.textElement.innerHTML = Math.floor(progress*100) + '% uploaded';

				if(progress == 1) { /// safe?
					// complete();
				}

				//workingStar.linkElement.style.background = 'rgba(100, 255, 100', '+progress+')';
			} else {
				//console.log('total size is unknown');
			}
		}

		function onUploadComplete(e) {
			uploaded = true;

			var d = e.target.responseText;
			var response = JSON.parse(d);

			if(response.error) {
				console.log(response.error); ////
				throw(response.error);
			}

			workingStar.id = response.sid;
			workingStar.element.id = 's'+workingStar.id;
			workingStar.element.setAttribute('data-prev', originStarID);

			actualizeCreation();
		}
	}

	function actualizeCreation() {
		window.onbeforeunload = false;

		if(!workingStar.fileReady || !workingStar.isPlaced) {
			console.log(workingStar);
			return false;
		}

		Interface.hideMessage();

		var formData = workingStar.export('FormData');

		var request = {
			method: "POST",
			body: formData
		};

		fetch('/ajax/actualize', request) ///REVISIT old browser compatability?
			.then(response => response.json())
			.then(result => {
				if(result.errors) {
					throw result.errors;
				}

				///REVISIT improve architecture, probably; maybe just
				//have server return the whole new star and call
				//loadData on workingStar:

				// Update star element attributes:
				workingStar.id = result.newStarID;
				workingStar.titleElement.className = 'text name';
				workingStar.titleElement.innerText = workingStar.title;
				workingStar.timestamp = result.timestamp;
				//workingStar.linkElement.href = '/' + result.newStarID;
				workingStar.element.classList.remove('placementSymbol');
				//workingStar.setAttribute('data-prev',

				Stars.addStar(workingStar);

				// Update ticket count:
				if(workingStar.originStarID == -1) {
					clientState.act(CONSTS.ACTION.USE_CREATION_TICKET);
				} else {
					clientState.act(CONSTS.ACTION.USE_RECREATION_TICKET);
				}

				// Shift stars around according to server instructions:
				for(var starID in result.starMovements) {
					var newPosition = result.starMovements[starID];
					Promise.resolve(Stars.clientStars[starID].moveToXY(newPosition.x, newPosition.y))
						///REVISIT architecture... should we prefer just a ClientStar.actualize() method?:
						.then(() => workingStar.observeProperties())
						.then(() => Stars.generateConstellationLines());
				}

				// Unset workingStar; we're finished:
				workingStar = null;

				// Back to homepage.
				navigation.navigate('/');
			})
			.catch(errors => {
				console.error(errors);
				for(var errIndex = 0; errIndex < errors.length; errIndex++) {
					var err = errors[errIndex];
					switch(err) {
						case CONSTS.ERROR.NO_CREATION_TICKETS:
						case CONSTS.ERROR.NO_RECREATION_TICKETS: {
							Interface.displayError(err);
						} break;

						default: {
							///REVISIT
						}
					}
				}
			});
	}
}
