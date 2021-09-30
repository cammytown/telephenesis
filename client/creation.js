import cor from './minlab/cor';
import spc from './minlab/spc'; //// ultimately whatever spc becomes probably won't output a singleton
import Anm from './minlab/anm';
import Upl from './minlab/upl';
import ColorTool from './minlab/colorTool.js';
import ajx from './minlab/ajx';
import HistoryTime from './js/history-time';
import Pijin from './js/pijin-js';

export default { init };

// document.addEventListener("DOMContentLoaded", init); ///

var client;
// var spc;
var validPlacementZone;

var placementSymbol;
var placementSymbolLink;

var workingCreation = {
	hostType: null,
	title: null,
	starID: null,
	originStarID: -1,
	x: null,
	y: null,
	color: null,
	fileReady: false,
	isPlaced: false,
}

var workingRecreation = {
	title: null,
	originStarID: null
}

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

	validPlacementZone = document.getElementById('validPlacementZone');
	validPlacementZone.style.display = 'none';
	spc.map.appendChild(validPlacementZone);
}

function onCreateSubmit(event) {
	// starting a new constellation

	event.preventDefault();

	workingCreation.hostType = 'external'; ////
	workingCreation.title = cor._('#genesis-star-title').value;
	workingCreation.fileURL = cor._('#genesis-file-url').value;

	if(workingCreation.hostType == 'upload') {
		////REVISIT
		// uploadCreation();
	} else {
		////TODO validate the file

		workingCreation.fileReady = true;

		initializeStarPlacement(true);
	}

}

function onRecreateSubmit(event) {
	initializeStarPlacement(false);
}

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

function initializeStarPlacement(genesis) {
	// close the creation UI
	HistoryTime.navigateTo('place'); ///REVISIT uris /create/place doesn't work with our thrown-together uri system
	// close();

	// create new star and use it as symbol for placement in the universe
	placementSymbol = document.getElementById('placementSymbol').cloneNode(true); /// deep parameter in IE8??
	placementSymbolLink = placementSymbol.getElementsByTagName('a')[0];

	var percent = placementSymbol.children[1];
	percent.className = 'progress';
	spc.map.appendChild(placementSymbol);

	// var genesis = workingCreation.originStarID == -1; ///ARCHITECTURE

	if(genesis) {
		// anywhere is valid

		spc.element.addEventListener('mousemove', movePlacementSymbolToMouse);
		spc.element.addEventListener('click', placementSymbolClick);

	} else {
		// create valid placement zone around the area of the origin star

		var current_x = parseInt(client.actingStar.style.left);
		var current_y = parseInt(client.actingStar.style.top);

		// center camera around origin star
		spc.ctr(current_x, current_y);

		validPlacementZone.style.left = current_x - 77 + 'px';
		validPlacementZone.style.top = current_y - 73 + 'px';
		validPlacementZone.style.display = 'block';

		cor.al(validPlacementZone, 'mousemove', movePlacementSymbolToMouse);
		cor.al(validPlacementZone, 'click', placementSymbolClick);
	}

	function movePlacementSymbolToMouse(event) {
		var x = event.clientX - spc.map.offsetLeft;
		var y = event.clientY - spc.map.offsetTop;

		placementSymbol.style.left = x + 'px';
		placementSymbol.style.top = y + 'px';
	}

	function placementSymbolClick(event) {
		// user has selected the position for their star

		workingCreation.x = event.clientX - spc.map.offsetLeft;
		workingCreation.y = event.clientY - spc.map.offsetTop;

		placementSymbol.style.left = workingCreation.x + 'px';
		placementSymbol.style.top = workingCreation.y + 'px';

		spc.ctr(workingCreation.x, workingCreation.y); /// create callback function for ctr? currently using validPlacementZone fadeOut delay

		if(genesis) {
			cor.rl(spc.element, 'mousemove', movePlacementSymbolToMouse);
			cor.rl(spc.element, 'click', placementSymbolClick);
		} else {
			cor.rl(validPlacementZone, 'mousemove', movePlacementSymbolToMouse);
			cor.rl(validPlacementZone, 'click', placementSymbolClick);
		}

		initializeStarColoring(genesis);
	}
}

function initializeStarColoring(genesis) {
	///TODO prevent movement??

	if(genesis) {
		// coloring a genesis star; any color is allowed

		var colorwheelSelect = document.getElementById('colorwheelSelect');
		placementSymbol.appendChild(colorwheelSelect);
		Anm.fadeIn(colorwheelSelect);

		cor.al(colorwheelSelect, 'mousemove', getColorFromWheelPosition);
		cor.al(colorwheelSelect, 'click', function() {
			cor.rl(colorwheelSelect, 'mousemove', getColorFromWheelPosition);

			workingCreation.color = placementSymbolLink.style.backgroundColor.substr(4).slice(0, -1); /// bad code / maybe unreliable
			Anm.fadeOut(colorwheelSelect);

			workingCreation.isPlaced = true;
			actualizeCreation();

			// if(!workingCreation.isUploaded) {
			// 	workingCreation.isPlaced = true;
			// } else {
			// 	actualizeCreation();
			// }
		});

		function getColorFromWheelPosition(e) {
			var cx = -(workingCreation.x + (spc.map.offsetLeft - e.clientX));
			var cy = (workingCreation.y + (spc.map.offsetTop - e.clientY));

			var angle = -Math.atan2(cy, cx) * 180 / Math.PI + 180;

			var selectedhue;

			if(angle>0 && angle<60) selectedhue = 110;
			else if(angle>60 && angle<120) selectedhue = 60;
			else if(angle>120 && angle<180) selectedhue = 25;
			else if(angle>180 && angle<240) selectedhue = 0;
			else if(angle>240 && angle<300) selectedhue = 270;
			else if(angle>300) selectedhue = 240;

			placementSymbolLink.style.backgroundColor = 'hsl('+selectedhue+', 45%, 80%)';
		}
	} else {
		// coloring a constellation star; only hues adjacent to origin star are allowed

		Anm.fadeOut(validPlacementZone);

		var colorShiftSelect = document.getElementById('colorShiftSelect');
		var rgb = client.actingStar.children[0].style.backgroundColor.substr(4).split(',');
		var hsl = ColorTool.rgb(rgb[0], rgb[1], parseInt(rgb[2]));
		colorShiftSelect.children[0].style.background = 'hsl('+(hsl[0]-17)+', 45%, 80%)';
		colorShiftSelect.children[1].style.background = 'hsl('+(hsl[0]+17)+', 45%, 80%)';
		placementSymbol.appendChild(colorShiftSelect);

		Anm.fadeIn(colorShiftSelect, 250, function() {
			cor.al(colorShiftSelect, 'mouseover', function(e) {
				placementSymbolLink.style.background = e.target.style.background;
			});

			cor.al(colorShiftSelect, 'click', function(e) { // (finish)
				workingCreation.color = e.target.style.backgroundColor.substr(4).slice(0, -1);
				placementSymbolLink.style.background = e.target.style.background;

				Anm.fadeOut(colorShiftSelect, 300, function() {
					colorShiftSelect.parentNode.removeChild(colorShiftSelect);
				});

				limbo.appendChild(validPlacementZone);

				document.body.removeAttribute('class');

				spc.on = true;

				workingCreation.isPlaced = true;
				actualizeCreation();

				// if(!workingCreation.isUploaded) {
				// 	workingCreation.isPlaced = true;
				// 	Anm.fadeOut(colorShiftSelect);
				// 	// console.log(workingCreation.color);
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

	var sourceStarID = client.actingStar ? parseInt(client.actingStar.id.split('s')[1]) : -1;
	var file = document.getElementById('submission');
	var upl = new Upl('/ajax/upload/'+sourceStarID, file, onUploadProgress, onUploadComplete);

	initializeStarPlacement();

	function onUploadProgress(e) {
		if (e.lengthComputable) {
			var progress = e.loaded / e.total;
			percent.innerHTML = Math.floor(progress*100) + '% uploaded';

			if(progress == 1) { /// safe?
				// complete();
			}

			//placementSymbolLink.style.background = 'rgba(100, 255, 100', '+progress+')';
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

		workingCreation.starID = response.sid;
		placementSymbol.id = 's'+workingCreation.starID;
		placementSymbol.setAttribute('data-prev', sourceStarID);

		actualizeCreation();
	}
}

function actualizeCreation() {
	HistoryTime.navigateTo('/');

	window.onbeforeunload = false;

	if(!workingCreation.fileReady || !workingCreation.isPlaced) {
		console.log(workingCreation);
		return false;
	}

	var formData = new FormData();
	formData.append('x', workingCreation.x);
	formData.append('y', workingCreation.y);
	formData.append('color', workingCreation.color);
	formData.append('starID', workingCreation.starID);
	formData.append('sourceStarID', workingCreation.sourceStarID);
	formData.append('hostType', workingCreation.hostType);
	formData.append('fileURL', workingCreation.fileURL);

	ajx('/ajax/actualize', formData, function(responseData) {
		console.log(responseData);
		var response = JSON.parse(responseData);
		placementSymbol.className = 'star';
		percent.className = 'text name';
		percent.innerHTML = response.creator;

		placementSymbolLink.href = '/' + workingCreation.starID;

		cor.al(placementSymbolLink, 'click', function(e) {
			e.preventDefault();
			state.updating = true;
			navigate('/' + workingCreation.starID);
		});
	});
}
