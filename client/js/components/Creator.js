import COR from '../libs/minlab/cor';
import spc from '../libs/minlab/spc'; //// ultimately whatever spc becomes probably won't output a singleton
import Anm from '../libs/minlab/anm';
import Upl from '../libs/minlab/upl';
import ColorTool from '../libs/minlab/colorTool.js';
// import ajx from '../libs/minlab/ajx'; ///TODO get rid of in favor or Pijin
// import HistoryTime from '../libs/history-time';

import navigation from './Navigation';
import clientState from './ClientState';
import ClientStar from './ClientStar';
import Stars from './Stars';
import Interface from './Interface';
//import uploads from './Uploads';

import Vector from '../../../abstract/Vector.js';
import * as CONSTS from '../../../abstract/constants.js';

export default new Creator();

/**
 * Class used for creating new stars on the client.
 * @constructor
 **/
function Creator() {
	const me = this;

	/**
	 * The star that the user is creating.
	 * @type ClientStar
	 **/
	this.workingStar;

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
	var colorShiftSelect;

	//var accessSettingInput;
	//var publicGameButton;
	//var privateGameButton;

	/** @type {Vector2} **/
	var mouseDownPos;

	/** The color wheel used for coloring genesis stars. **/
	var colorwheelSelect;

	this.init = function() {
		// accessSettingInput = COR._('#accessSetting')
		// publicGameButton = COR._('#publicGameButton');
		// privateGameButton = COR._('#privateGameButton');

		// publicGameButton.addEventListener('click', onPublicGameButtonClick);
		// privateGameButton.addEventListener('click', onPrivateGameButtonClick);

		COR._('#create-page').addEventListener('submit', onCreateSubmit);
		COR._('#recreate-page').addEventListener('submit', onCreateSubmit);
		COR.addClassListener('submission-file-input', 'change', onUploadFileSelect);
		COR.addClassListener('artist-id-input', 'input', onArtistIDSelect);

		document.querySelectorAll('.artist-id-input').forEach(artistIDInput => {
			// Set all artist ID selects to their first value so that the
			// artist ID creation shows up when selected:
			//@REVISIT more of a quick-fix
			artistIDInput.selectedIndex = 0;
		});

		for(var recreateLink of COR._('.createStar')) {
			recreateLink.addEventListener('click', onCreateStarClick);
		}

		for(var recreateLink of COR._('.recreateStar')) {
			recreateLink.addEventListener('click', onRecreateStarClick);
		}

		validPlacementZone = document.getElementById('validPlacementZone');
		validPlacementZone.style.display = 'none';
		colorShiftSelect = document.getElementById('colorShiftSelect');
		colorwheelSelect = document.getElementById('colorwheelSelect');

		colorwheelSelect.addEventListener('mousemove', getColorFromWheelPosition);
		colorwheelSelect.addEventListener('click', onColorwheelChoice);
	}

	/** Cancel creation process. **/
	this.cancel = function() {
		console.log('star creation cancelled');
		me.workingStar.delete();
		me.workingStar = null;
		Interface.hideMessage();
		endCreationStep();
		navigation.navigate('/');
	}

	function onCreateStarClick(event) {
		event.preventDefault();

		navigation.navigate(event.target.pathname);
	}

	function onRecreateStarClick(event) {
		event.preventDefault();

		navigation.navigate(event.target.pathname
			+ '/' + clientState.actingStar.publicID);
	}

	/**
	 * Begin star creation process.
	 * @param {ClientStar | false} originStar
	 **/
	this.initializeCreation = function(originStar = false) {
		me.workingStar = new ClientStar();

		me.workingStar.publicID = "placeholder"; ///REVISIT architecture
		//me.workingStar.element.classList.add(
		me.workingStar.element.style.display = 'none';
		me.workingStar.originStarID = originStar ? originStar.publicID : -1;
		me.workingStar.tier = originStar ? originStar.tier + 1 : 0;
		//@TODO doesn't feel like this belongs here:
		me.workingStar.hostType = 'upload';

		if(originStar) {
			workingOriginStar = originStar;
		}
	}

	function onCreateSubmit(event) {
		// starting a new constellation

		event.preventDefault();

		var formEle = event.target;

		me.workingStar.title = formEle.querySelector('.star-title-input').value;
		me.workingStar.fileURL = formEle.querySelector('.file-url-input').value;
		me.workingStar.artist = {
			publicID: formEle.querySelector('.artist-id-input').value,
		};
		console.log(me.workingStar);

		if(me.workingStar.artist.publicID == 'create_new_artist') {
			//@REVISIT this architecture; don't like it that much but don't
			//want to rework anything right now... maybe it's not that bad
			//though:

			var artistName = formEle.querySelector('.artist-name-input').value;
			me.workingStar.artist.name = artistName;
			//me.workingStar.artistID = 'create_new_artist:'
				//+ formEle.querySelector('.new-artist-name-input').value;
		}

		me.workingStar.element.style.display = null; ///REVISIT best method?

		//me.workingStar.title = COR._('#genesis-star-title').value;
		//me.workingStar.fileURL = COR._('#genesis-file-url').value;

		if(me.workingStar.hostType == 'upload') {
			////REVISIT
			// uploadCreation();
		} else {
			////TODO validate the file

			me.workingStar.fileReady = true;
		}

		initializePlacement();

	}

	// function onRecreateSubmit(event) {
	// 	initializePlacement(false);
	// }

	// function onPublicGameButtonClick(event) {
	// 	// COR._('#privateGameSelect');
	// 	accessSetting.value = 'public';
	// 	COR.ac(publicGameButton, 'active');
	// 	COR.rc(privateGameButton, 'active');
	// 	var timeSettingsEl = COR._('#timeSettings');
	// 	COR.ac(timeSettingsEl, 'public');
	// 	COR.rc(timeSettingsEl, 'private');
	// }

	// function onPrivateGameButtonClick(event) {
	// 	accessSetting.value = 'private';
	// 	COR.ac(privateGameButton, 'active');
	// 	COR.rc(publicGameButton, 'active');
	// 	var timeSettingsEl = COR._('#timeSettings');
	// 	COR.ac(timeSettingsEl, 'private');
	// 	COR.rc(timeSettingsEl, 'public');
	// }

	///REVISIT maybe rename this to be more specific to event handling since
	//that's currently all it does:
	function endCreationStep() {
		switch(currentStep) {
			case 'place': {
				if(me.workingStar.originStarID == -1) { // Is a constellation genesis star.
					spc.element.removeEventListener('mousemove', moveWorkingStarToMouse);
					spc.element.removeEventListener('mouseup', onPlacementMouseUp);
				} else {
					validPlacementZone.removeEventListener('mousemove', moveWorkingStarToMouse);
					validPlacementZone.removeEventListener('mouseup', onPlacementMouseUp);
					Anm.fadeOut(validPlacementZone, 300, () => {
						limbo.appendChild(validPlacementZone);
					});
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
		navigation.close();

		///REVISIT uris /create/place doesn't work with our thrown-together uri system
		//navigation.navigate('place');

		///TODO probably replace 'notification' message type with something
		//like 'createInstruction' or something and have it appear differently
		//(more prominently):
		if(me.workingStar.originStarID == -1) {
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
			//validPlacementZone.style.display = 'block';
			Anm.fadeIn(validPlacementZone);

			validPlacementZone.addEventListener('mousemove', moveWorkingStarToMouse);
			validPlacementZone.addEventListener('mousedown', onPlacementMouseDown);
			validPlacementZone.addEventListener('mouseup', onPlacementMouseUp);

			spc.map.appendChild(validPlacementZone);

			// Center camera around origin star:
			spc.ctr(current_x, current_y);
		}

	}

	function moveWorkingStarToMouse(event) {
		me.workingStar.animateToXY(
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

		// me.workingStar.animateToXY( ///REVISIT do we need to have this code both here and in moveWorkingStarToMouse?
		// 	event.clientX - spc.map.offsetLeft,
		// 	event.clientY - spc.map.offsetTop
		// );

		// Stars.addStar(me.workingStar);

		// spc.ctr(me.workingStar.position.x, me.workingStar.position.y); /// create callback function for ctr? currently using validPlacementZone fadeOut delay

		endCreationStep();

		initializeColoring();
	}

	function initializeColoring() {
		///TODO prevent movement??

		currentStep = 'color';

		if(me.workingStar.originStarID == -1) {
			Interface.displayMessage("Choose a color for your star.", 'notification', 0);

			me.workingStar.element.appendChild(colorwheelSelect);
			Anm.fadeIn(colorwheelSelect);
		} else {
			Interface.displayMessage("Choose a color for your star. You can only shift the color slightly "
				+ "from the star you recreated!", 'notification', 0);

			// Coloring a constellation star; only hues adjacent to origin star are allowed.


			///REVISIT at least document with comments if not refactor:

			var rgb = workingOriginStar.linkElement.style.backgroundColor.substr(4).split(',');
			var hsl = ColorTool.rgb(rgb[0], rgb[1], parseInt(rgb[2]));
			colorShiftSelect.children[0].style.background = 'hsl('+(hsl[0]-17)+', 45%, 80%)';
			colorShiftSelect.children[1].style.background = 'hsl('+(hsl[0]+17)+', 45%, 80%)';
			me.workingStar.element.appendChild(colorShiftSelect);

			Anm.fadeIn(colorShiftSelect, 250, function() {
				colorShiftSelect.addEventListener('mouseover', function(e) {
					me.workingStar.linkElement.style.background = e.target.style.background;
				});

				colorShiftSelect.addEventListener('click', function(e) { // (finish)
					me.workingStar.color = e.target.style.backgroundColor.substr(4).slice(0, -1);
					me.workingStar.linkElement.style.background = e.target.style.background;

					Anm.fadeOut(colorShiftSelect, 300, function() {
						limbo.appendChild(colorShiftSelect);
						//colorShiftSelect.parentNode.removeChild(colorShiftSelect);
					});


					// document.body.removeAttribute('class');
					// spc.on = true;
					me.workingStar.isPlaced = true;
					actualizeStar();

					// if(!me.workingStar.fileReady) {
					// 	me.workingStar.isPlaced = true;
					// 	Anm.fadeOut(colorShiftSelect);
					// 	// console.log(me.workingStar.color);
					// } else {
					// 	actualizeStar()
					// }
				});
			});
		}

		// 	guide.innerHTML = "Now choose a color. You can only shift the color 11 degrees from the previous star.";
	}

	// coloring a genesis star; any color is allowed
	function getColorFromWheelPosition(e) {
		var cx = -(me.workingStar.position.x + (spc.map.offsetLeft - e.clientX)); ///TODO + half star width, I think? same for below with height?
		var cy = (me.workingStar.position.y + (spc.map.offsetTop - e.clientY));

		var angle = -Math.atan2(cy, cx) * 180 / Math.PI + 180;

		var selectedhue;

		if(angle>0 && angle<60) selectedhue = 110;
		else if(angle>60 && angle<120) selectedhue = 60;
		else if(angle>120 && angle<180) selectedhue = 25;
		else if(angle>180 && angle<240) selectedhue = 0;
		else if(angle>240 && angle<300) selectedhue = 270;
		else if(angle>300) selectedhue = 240;

		me.workingStar.linkElement.style.backgroundColor = 'hsl('+selectedhue+', 45%, 80%)';
	}

	function onColorwheelChoice(event) {
		colorwheelSelect.removeEventListener('mousemove', getColorFromWheelPosition);

		/// bad code / maybe unreliable
		me.workingStar.color = me.workingStar.linkElement.style.backgroundColor.substr(4).slice(0, -1);
		Anm.fadeOut(colorwheelSelect);

		me.workingStar.isPlaced = true;
		actualizeStar();

		// if(!me.workingStar.fileReady) {
		// 	me.workingStar.isPlaced = true;
		// } else {
		// 	actualizeStar();
		// }
	}

	function onArtistIDSelect(event) {
		var selectEle = event.target;

		// If user chose option to create a new artist identity:
		if(selectEle.value == 'create_new_artist') { //@TODO maybe a more obscure value
			// Show artist identity creation fields:
			document.querySelectorAll('.artist-id-creation-section')
				.forEach(artistIDCreationEle => {
					artistIDCreationEle.style.display = 'block';
				});
		} else {
			document.querySelectorAll('.artist-id-creation-section')
				.forEach(artistIDCreationEle => {
					artistIDCreationEle.style.display = 'none';
				});
		}
	}

	function onUploadFileSelect(event) {
		var fileEle = event.target;

		me.workingStar.file = {
			name: fileEle.files[0].name,
			type: fileEle.files[0].type,
			size: fileEle.files[0].size,
			lastModified: fileEle.files[0].lastModified,
		}

		//@TODO make pretty (jsx?):
		me.workingStar.uploadProgressElement = document.createElement('div');
		me.workingStar.uploadProgressElement.classList.add('upload-progress');
		me.workingStar.element.appendChild(me.workingStar.uploadProgressElement);

		initializeStar().then(() => {
			console.log('star initialized');
			console.log(me.workingStar);
			var upl = new Upl( //@TODO get rid of or improve Upl
				me.workingStar.uploadURL,
				fileEle,
				onUploadProgress,
				onUploadComplete,
				'PUT',
				true
			);
		});
	}

	function onUploadProgress(e) {
		if (e.lengthComputable) {
			var progress = e.loaded / e.total;
			var progressText = Math.floor(progress*100) + '% uploaded';

			me.workingStar.uploadProgressElement.innerText = progressText;

			if(me.workingStar.isPlaced) {
				// Show upload progress as galaxy message:
				Interface.displayMessage(progressText);
			}

			//me.workingStar.linkElement.style.background = 'rgba(100, 255, 100', '+progress+')';
		} else {
			//@REVISIT
			//console.log('total size is unknown');
		}
	}

	function onUploadComplete(e) {
		me.workingStar.fileReady = true;

		//@TODO improve architecture:
		Anm.fadeOut(me.workingStar.uploadProgressElement, 1000, () => {
			//@REVISIT this breaks if they place their star before fade out occurs:
			//me.workingStar.uploadProgressElement.remove();
		});

		//var d = e.target.responseText;
		//var result = JSON.parse(d);

		//console.log(result);
		//if(response.error) {
		//    console.log(response.error); ////
		//    throw(response.error);
		//}

		//me.workingStar.publicID = response.sid;
		//me.workingStar.element.id = 's'+me.workingStar.publicID;
		//me.workingStar.element.setAttribute('data-prev', originStarID);

		actualizeStar();
	}

	function initializeStar() {
		return COR.POST('/ajax/initialize-star', me.workingStar.export())
			.then(response => response.json())
			.then(result => {
				console.log('initialize response');
				console.log(result);
				me.workingStar.loadData(result.newStar, ['uploadURL']);
			});

		//uploads.requestuploadurl(me.workingstar).then(uploadurl => {
			//console.log(uploadurl);
	}

	function actualizeStar() {
		window.onbeforeunload = false;

		if(!me.workingStar.fileReady || !me.workingStar.isPlaced) {
			console.log(me.workingStar);
			return false;
		}

		Interface.hideMessage();

		//var formData = me.workingStar.export('FormData');

		//var request = {
		//    method: "POST",
		//    body: formData
		//};

		//fetch('/ajax/actualize', request) ///REVISIT old browser compatability?
		return COR.POST('/ajax/actualize-star', me.workingStar.export())
			.then(response => response.json())
			.then(result => {
				if(result.errors.length) {
					throw result.errors;
				}

				me.workingStar.element.classList.remove('placementSymbol');

				// Load server data into star:
				me.workingStar.loadData(result.actualizedStar);

				Stars.addStar(me.workingStar);

				// Update ticket count:
				if(me.workingStar.originStarID == -1) {
					clientState.act(CONSTS.ACTION.USE_CREATION_TICKET);
				} else {
					clientState.act(CONSTS.ACTION.USE_RECREATION_TICKET);
				}

				// Shift stars around according to server instructions:
				for(var starID in result.starMovements) {
					var newPosition = result.starMovements[starID];
					Promise.resolve(Stars.clientStars[starID].animateToXY(newPosition.x, newPosition.y))
						.then(() => me.workingStar.observeProperties())
						///@REVISIT is it safe to not unset workingStar til later??:
						.then(() => me.workingStar = null)
						.then(() => Stars.generateConstellationLines());
				}

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
