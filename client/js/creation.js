import cor from './libs/minlab/cor';
import spc from './libs/minlab/spc'; //// ultimately whatever spc becomes probably won't output a singleton
import Anm from './libs/minlab/anm';
import Upl from './libs/minlab/upl';
import ColorTool from './libs/minlab/colorTool.js';
import ajx from './libs/minlab/ajx'; ///TODO get rid of in favor or Pijin
// import HistoryTime from './libs/history-time';

import navigation from './components/Navigation';
import clientState from './components/ClientState.js';
import ClientStar from './components/ClientStar.js';
import Stars from './components/Stars.js';

export default { init };

// document.addEventListener("DOMContentLoaded", init); ///

var client;
var validPlacementZone;

var workingStar;

var accessSettingInput;
var publicGameButton;
var privateGameButton;

function init(Telep) {
	client = Telep;

	// accessSettingInput = cor._('#accessSetting')
	// publicGameButton = cor._('#publicGameButton');
	// privateGameButton = cor._('#privateGameButton');

	// publicGameButton.addEventListener('click', onPublicGameButtonClick);
	// privateGameButton.addEventListener('click', onPrivateGameButtonClick);

	cor._('#create').addEventListener('submit', onCreateSubmit);
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
}

function onCreateStarClick(event) {
	event.preventDefault();

	workingStar = new ClientStar();
	workingStar.id = "placeholder"; ///REVISIT architecture
	workingStar.originStarID = -1;
}

function onRecreateStarClick(event) {
	event.preventDefault();

	workingStar = new ClientStar();
	workingStar.id = "placeholder"; ///REVISIT architecture
	workingStar.originStarID = parseInt(clientState.actingStar.id.split('s')[1]);
}

function onCreateSubmit(event) {
	// starting a new constellation

	event.preventDefault();

	workingStar.hostType = 'external'; ////
	workingStar.title = cor._('#genesis-star-title').value;
	workingStar.fileURL = cor._('#genesis-file-url').value;

	if(workingStar.hostType == 'upload') {
		////REVISIT
		// uploadCreation();
	} else {
		////TODO validate the file

		workingStar.fileReady = true;

		initializeStarPlacement();
	}

}

// function onRecreateSubmit(event) {
// 	initializeStarPlacement(false);
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

function initializeStarPlacement() {
	// close the creation UI
	navigation.navigate('place'); ///REVISIT uris /create/place doesn't work with our thrown-together uri system
	// close();

	var genesis = workingStar.originStarID == -1; ///ARCHITECTURE

	if(genesis) {
		// anywhere is valid

		spc.element.addEventListener('mousemove', moveWorkingStarToMouse);
		spc.element.addEventListener('click', workingStarClick);

	} else {
		// create valid placement zone around the area of the origin star

		var current_x = parseInt(clientState.actingStar.style.left);
		var current_y = parseInt(clientState.actingStar.style.top);

		// center camera around origin star
		spc.ctr(current_x, current_y);

		validPlacementZone.style.left = current_x - 77 + 'px';
		validPlacementZone.style.top = current_y - 73 + 'px';
		validPlacementZone.style.display = 'block';

		cor.al(validPlacementZone, 'mousemove', moveWorkingStarToMouse);
		cor.al(validPlacementZone, 'click', workingStarClick);
	}

	function moveWorkingStarToMouse(event) {
		workingStar.moveToXY(
			event.clientX - spc.map.offsetLeft,
			event.clientY - spc.map.offsetTop
		);
	}

	function workingStarClick(event) {
		// User has selected the position for their star.

		// workingStar.moveToXY( ///REVISIT do we need to have this code both here and in moveWorkingStarToMouse?
		// 	event.clientX - spc.map.offsetLeft,
		// 	event.clientY - spc.map.offsetTop
		// );

		// Stars.addStar(workingStar);

		// spc.ctr(workingStar.position.x, workingStar.position.y); /// create callback function for ctr? currently using validPlacementZone fadeOut delay

		if(genesis) {
			cor.rl(spc.element, 'mousemove', moveWorkingStarToMouse);
			cor.rl(spc.element, 'click', workingStarClick);
		} else {
			cor.rl(validPlacementZone, 'mousemove', moveWorkingStarToMouse);
			cor.rl(validPlacementZone, 'click', workingStarClick);
		}

		initializeStarColoring(genesis);
	}
}

function initializeStarColoring(genesis) {
	///TODO prevent movement??

	if(genesis) {
		// coloring a genesis star; any color is allowed

		var colorwheelSelect = document.getElementById('colorwheelSelect');
		workingStar.element.appendChild(colorwheelSelect);
		Anm.fadeIn(colorwheelSelect);

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

		function getColorFromWheelPosition(e) {
			var cx = -(workingStar.position.x + (spc.map.offsetLeft - e.clientX));
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
	} else {
		// coloring a constellation star; only hues adjacent to origin star are allowed

		Anm.fadeOut(validPlacementZone);

		var colorShiftSelect = document.getElementById('colorShiftSelect');
		var rgb = clientState.actingStar.getElementsByTagName('a')[0].style.backgroundColor.substr(4).split(',');
		var hsl = ColorTool.rgb(rgb[0], rgb[1], parseInt(rgb[2]));
		// console.log(clientState.actingStar.getElementsByTagName('a')[0].style.backgroundColor)
		// console.log(clientState.actingStar.getElementsByTagName('a')[0])
		// console.log(rgb);
		// console.log(hsl);
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

function uploadCreation() {
	/// create back and forth navigation
	/// could use some attention

	// state.updating = false;
	navigation.navigate('/');
	// document.body.className = null;
	//spc.ctr(0, 0);

	var originStarID = clientState.actingStar ? parseInt(clientState.actingStar.id.split('s')[1]) : -1;
	var file = document.getElementById('submission');
	var upl = new Upl('/ajax/upload/'+originStarID, file, onUploadProgress, onUploadComplete);

	initializeStarPlacement();

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
	navigation.navigate('/');

	window.onbeforeunload = false;

	if(!workingStar.fileReady || !workingStar.isPlaced) {
		console.log(workingStar);
		return false;
	}

	var formData = new FormData();
	for (var propIndex = 0; propIndex < workingStar.identityProps.length; propIndex++) {
		var identityProp = workingStar.identityProps[propIndex];

		// If property is an object:
		if(workingStar.objectProps.indexOf(identityProp) != -1) { ///probably keep array of which properties are objects in Star class
			formData.append(identityProp, JSON.stringify(workingStar[identityProp]));

		// Property is a literal value; no need to stringify:
		} else {
			formData.append(identityProp, workingStar[identityProp]);
		}

	}

	var request = {
		method: "POST",
		body: formData
	};

	fetch('/ajax/actualize', request) ///REVISIT old browser compatability?
		.then(response => response.json())
		.then(result => {
			// Update star element attributes:
			workingStar.id = result.newStarID;
			workingStar.titleElement.className = 'text name';
			workingStar.titleElement.innerText = workingStar.title;
			workingStar.linkElement.href = '/' + result.newStarID;

			Stars.addStar(workingStar);

			// Shift stars around according to server instructions:
			for(var starID in result.starMovements) {
				var newPosition = result.starMovements[starID];
				Promise.resolve(Stars.clientStars[starID].moveToXY(newPosition.x, newPosition.y))
					.then(() => Stars.generateConstellationLines());
			}

			// Add normal star click listener:
			cor.al(workingStar.linkElement, 'click', function(e) {
				e.preventDefault();
				state.updating = true;
				navigate('/' + workingStar.id);
			});
		});

	// ajx('/ajax/actualize', formData, function(responseData) {
	// 	console.log(responseData);
	// 	var response = JSON.parse(responseData);
	// 	workingStar.element.className = 'star';
	// 	workingStar.titleElement.className = 'text name';
	// 	workingStar.titleElement.innerHTML = response.creator;

	// 	workingStar.linkElement.href = '/' + workingStar.starID;

	// 	cor.al(workingStar.linkElement, 'click', function(e) {
	// 		e.preventDefault();
	// 		state.updating = true;
	// 		navigate('/' + workingStar.starID);
	// 	});
	// });
}
