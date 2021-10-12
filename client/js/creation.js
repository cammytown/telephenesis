import cor from './libs/minlab/cor';
import spc from './libs/minlab/spc'; //// ultimately whatever spc becomes probably won't output a singleton
import Anm from './libs/minlab/anm';
import Upl from './libs/minlab/upl';
import ColorTool from './libs/minlab/colorTool.js';
import ajx from './libs/minlab/ajx'; ///TODO get rid of in favor or Pijin
import HistoryTime from './libs/history-time';

import clientState from './components/ClientState';

// import Pijin from './js/pijin-js';

export default { init };

// document.addEventListener("DOMContentLoaded", init); ///

var client;
// var spc;
var validPlacementZone;

var workingStar = {
	hostType: null,
	title: null,
	starID: null,
	originStarID: -1,
	x: null,
	y: null,
	color: null,

	fileReady: false,
	isPlaced: false,

	element: false,
	linkElement: false,
	textElement: false,
}

// var workingRecreation = {
// 	title: null,
// 	originStarID: null
// }

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

	for(var recreateLink of cor._('.recreate')) {
		recreateLink.addEventListener('click', onRecreateClick);

	}

	validPlacementZone = document.getElementById('validPlacementZone');
	validPlacementZone.style.display = 'none';
	spc.map.appendChild(validPlacementZone);
}

function onRecreateClick(event) {
	event.preventDefault();

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
	HistoryTime.navigateTo('place'); ///REVISIT uris /create/place doesn't work with our thrown-together uri system
	// close();

	// create new star and use it as symbol for placement in the universe
	workingStar.element = document.getElementById('placementSymbol').cloneNode(true); /// deep parameter in IE8??
	workingStar.linkElement = workingStar.element.getElementsByTagName('a')[0];
	workingStar.textElement = workingStar.element.children[1];
	workingStar.textElement.className = 'progress';
	spc.map.appendChild(workingStar.element);

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
		var x = event.clientX - spc.map.offsetLeft;
		var y = event.clientY - spc.map.offsetTop;

		workingStar.element.style.left = x + 'px';
		workingStar.element.style.top = y + 'px';
	}

	function workingStarClick(event) {
		// user has selected the position for their star

		workingStar.x = event.clientX - spc.map.offsetLeft;
		workingStar.y = event.clientY - spc.map.offsetTop;

		workingStar.element.style.left = workingStar.x + 'px';
		workingStar.element.style.top = workingStar.y + 'px';

		// spc.ctr(workingStar.x, workingStar.y); /// create callback function for ctr? currently using validPlacementZone fadeOut delay

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
			var cx = -(workingStar.x + (spc.map.offsetLeft - e.clientX));
			var cy = (workingStar.y + (spc.map.offsetTop - e.clientY));

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
		console.log(clientState.actingStar.getElementsByTagName('a')[0].style.backgroundColor)
		console.log(clientState.actingStar.getElementsByTagName('a')[0])
		console.log(rgb);
		console.log(hsl);
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

				document.body.removeAttribute('class');

				spc.on = true;

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
	HistoryTime.navigateTo('/');
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

		workingStar.starID = response.sid;
		workingStar.element.id = 's'+workingStar.starID;
		workingStar.element.setAttribute('data-prev', originStarID);

		actualizeCreation();
	}
}

function actualizeCreation() {
	HistoryTime.navigateTo('/');

	window.onbeforeunload = false;

	if(!workingStar.fileReady || !workingStar.isPlaced) {
		console.log(workingStar);
		return false;
	}

	var formData = new FormData();
	formData.append('starID', workingStar.starID); ///NOTE not currently in use
	formData.append('starTitle', workingStar.title);
	formData.append('x', workingStar.x);
	formData.append('y', workingStar.y);
	formData.append('color', workingStar.color);
	// formData.append('color', workingStar.color);
	formData.append('originStarID', workingStar.originStarID);
	formData.append('hostType', workingStar.hostType);
	formData.append('fileURL', workingStar.fileURL);

	var request = {
		method: "POST",
		body: formData
	};

	fetch('/ajax/actualize', request) ///REVISIT old browser compatability?
		.then(response => response.json())
		.then(result => {
			workingStar.textElement.className = 'text name';
			workingStar.textElement.innerHTML = result.creator;

			workingStar.linkElement.href = '/' + workingStar.starID;

			cor.al(workingStar.linkElement, 'click', function(e) {
				e.preventDefault();
				state.updating = true;
				navigate('/' + workingStar.starID);
			});
		})

	// ajx('/ajax/actualize', formData, function(responseData) {
	// 	console.log(responseData);
	// 	var response = JSON.parse(responseData);
	// 	workingStar.element.className = 'star';
	// 	workingStar.textElement.className = 'text name';
	// 	workingStar.textElement.innerHTML = response.creator;

	// 	workingStar.linkElement.href = '/' + workingStar.starID;

	// 	cor.al(workingStar.linkElement, 'click', function(e) {
	// 		e.preventDefault();
	// 		state.updating = true;
	// 		navigate('/' + workingStar.starID);
	// 	});
	// });
}
