import cor from '../libs/minlab/cor';
import spc from '../libs/minlab/spc'; /// relying on implied singleton
import Anm from '../libs/minlab/anm';
import HistoryTime from '../libs/history-time';

import clientState from './ClientState';
import Interface from './Interface';
import Stars from './Stars';
import Creator from './Creator';
import CONSTS from '../../../abstract/constants';

export default new ClientNavigation();

///TODO consider combining with Interface
/**
 * Handles page transitions and navigation links.
 * @constructor
 */
function ClientNavigation() {
	var me = this;

	var starContextMenu;
	var galaxyContextMenu;

	var boxPages = [
		'login',
		'register',
		'settings',
		//'invite',
		'create',
		'recreate',
		'help',
		//'renameStar',
		//'deleteStar',
	];

	var createPages = [
		'create',
		'recreate',
		'place',
		'color',
	];

	this.init = function() {
		// Setup element references:
		starContextMenu = document.getElementById('starContextMenu');
		galaxyContextMenu = document.getElementById('galaxyContextMenu');

		// Add listener for URI changes:
		HistoryTime.bindPathToCallback('*', observePath);

		// Add listeners to internal navigation links:
		var navLinks = document.getElementsByClassName('nav'); ///REVISIT not really into this class name; something more descriptive?
		for(var navLinkIndex = 0; navLinkIndex < navLinks.length; navLinkIndex++) {
			var navLink = navLinks[navLinkIndex];
			navLink.addEventListener('click', onNavLinkClick);
		}

		var ajaxLinks = document.querySelectorAll('a.ajax'); ///REVISIT architecture
		for(var ajaxLinkIndex = 0; ajaxLinkIndex < ajaxLinks.length; ajaxLinkIndex++) {
			var ajaxLink = ajaxLinks[ajaxLinkIndex];
			ajaxLink.addEventListener('click', onAjaxLinkClick);
		}

		// Close context menus when outer space is clicked:
		cor.al(spc.element, 'click', function(event) {
			closeContextMenu();

			//if(event.target.parentNode.id == 'spc' && HistoryTime.state.path != '/') { ///
			//        // state.updating = true;
			//        me.navigate('/'); //// page title
			//}
		});

		// Open context menu on right click
		cor.al(spc.element, 'contextmenu', onContextMenu);
	}

	this.ready = function() {
		///REVISIT architecture:
		// Set activeWindow if path calls for it; it will already be visible
		// from the server render:
		var page = location.pathname.split('/')[1];
		if(page) {
			///REVISIT ugly architecture:
			if(boxPages.includes(page)) {
				// Assume the server already displayed the page; set variables:
				clientState.currentPage = page;
				var initialPageEle = document.getElementById(page + '-page');
				clientState.activeWindow = initialPageEle;
			}

			switch(page) {
				case 'star':
				case 'create':
				case 'recreate': {
					// Run normal path logic, setting pageInit arg to true:
					observePath(location.pathname, true);
				} break;
			}
		}

	}

	function onNavLinkClick(event) {
		event.preventDefault();

		// state.updating = true;

		me.navigate(event.target.pathname); ///// make page titles

		// if(cor.cc(this.parentNode, 'star')) {
		// 	navigate(path);
		// } else {
		// 	if(state.path == path) navigate('/');
		// 	else navigate(path);
		// }
	}

	function onAjaxLinkClick(event) {
		event.preventDefault();

		// Observe path without actually changing it:
		observePath(event.target.pathname);
	}

	/**
	 * Callback for when user opens the context menu (i.e. right-clicking).
	 * @param {Event} event
	 **/
	function onContextMenu(event) {
		event.preventDefault();
		event.stopPropagation();

		closeContextMenu();

		var isStarClick = cor.cc(event.target.parentNode, 'star'); ///REVISIT weird architecture?
		if(isStarClick) {
			var starEle = event.target.parentNode;
			var starID = parseInt(starEle.id.split('s')[1]);
			console.log(Stars.clientStars);
			var clientStar = Stars.clientStars[starID];

			//document.getElementById('download').href = '/f/'+starID+'.mp3';
			clientState.actingStar = clientStar;

			var bookmarkLink = starContextMenu.getElementsByClassName('bookmarkToggle')[0];
			///TODO i think add starIDs to the URIs? but actually,
			//then people can send users to that link to force them
			//to bookmark; so let's not / or at least have a
			//confirmation box if that happens.

			if(clientStar.isBookmarked) {
				bookmarkLink.innerText = "Remove Bookmark";
				bookmarkLink.href = "/removeBookmark";
			} else {
				bookmarkLink.innerText = "Bookmark";
				bookmarkLink.href = "/bookmark";
			}

			if(Interface.order == CONSTS.ORDER.GALAXY) {
				starContextMenu.style.left = clientStar.position.x + 12 + 'px';
				starContextMenu.style.top = clientStar.position.y - 5 + 'px';
			} else {
				starContextMenu.style.left = event.clientX + 'px';
				starContextMenu.style.top = event.clientY + 'px';
			}

			//starContextMenu.children[1].href = starID+'/recreate';

			spc.map.appendChild(starContextMenu);
		} else {
			closeContextMenu();
			clientState.actingStar = false;

			galaxyContextMenu.style.left = event.clientX + 'px';
			galaxyContextMenu.style.top = event.clientY + 'px';

			document.body.appendChild(galaxyContextMenu);
		}
	}

	/**
	 * Close any open context menu.
	 **/
	function closeContextMenu() {
		// var menus = document.getElementsByClassName('star menu');
		// if(menus.length) menus[0].className = 'star';
		limbo.appendChild(starContextMenu);
		limbo.appendChild(galaxyContextMenu);
	}

	/**
	 * Navigate to a URI path.
	 * @param {string} path - The path to navigate to.
	 **/
	this.navigate = function(path) {
		var pathParts = path.split('/');
		var newPage = pathParts[1];

		var pageTitle = "telephenesis";
		if(newPage) {
			////TODO
			pageTitle += ' : ' + newPage;
		}

		// Pass state handling to HistoryTime:
		HistoryTime.navigateTo(path, pageTitle);
	}

	/**
	 * Unload anything related to the current page.
	 * @param {string} newPage
	 **/
	function preparePathChange(newPage) {
		var oldPage = clientState.currentPage;

		// Handle previous page state: ///REVISIT move to separate method?
		if(boxPages.includes(clientState.currentPage)) {
			close();
		} else {
			switch(oldPage) {
				case '':
				case 'star':
				{
					// Nothing.
				} break;

				case 'place':
				case 'color':
				{
					// If exiting creation flow:
					if(!createPages.includes(newPage)) {
						// Remove working star:
						Creator.cancel();
					}
				} break;

				default: {
					console.error("observePath(): unhandled oldPage '" + oldPage + '"');
				}
			}
		}
	}

	/**
	 * Manipulates the page state according to the path.
	 * @param {string} path - The path that the client navigated to.
	 **/
	///REVISIT not sold on architecture of pageInitialization:
	function observePath(path, pageInitialization = false) {
		var pathParts = path.split('/');
		var newPage = pathParts[1];

		// If this is not initial page load:
		if(!pageInitialization) {
			closeContextMenu(); ///REVISIT always?

			preparePathChange(newPage);

			if(boxPages.includes(newPage)) {
				open(newPage);
			}

			if(createPages.includes(newPage)) {
				Interface.sort(CONSTS.ORDER.GALAXY);
			}
		}

		switch(newPage) {
			case 'star': {
				var starID = parseInt(pathParts[2]);

				if(pageInitialization) { ///REVISIT only on pageInit ?
					///REVISIT probably do this on server side; though maybe it's cool
					spc.ctr(Stars.clientStars[starID].position.x, Stars.clientStars[starID].position.y); ///TODO change spc over to Vectors
				}

				Stars.clientStars[starID].play();
			} break;

			case 'create': {
				// Check if user has creation tickets:
				if(!clientState.creationTickets) {
					Interface.displayError(CONSTS.ERROR.NO_CREATION_TICKETS);
					return false;
				}

				Creator.initializeCreation();
			} break;

			case 'recreate': {
				var starID = parseInt(pathParts[2]);

				// Check if user has recreation tickets:
				if(!clientState.recreationTickets) {
					Interface.displayError(CONSTS.ERROR.NO_RECREATION_TICKETS);
					return false;
				}

				Creator.initializeCreation(Stars.clientStars[starID]);
			} break;

			case 'bookmark': {
				limbo.appendChild(starContextMenu); ///REVISIT
				clientState.actingStar.bookmark();
			} break;

			case 'removeBookmark': {
				limbo.appendChild(starContextMenu);
				clientState.actingStar.removeBookmark();
			} break;

			case 'logout': {
				logout().then(() => me.navigate('/'));
			} break;

			case '': { ///REVISIT architecture; should newPage be false for this?
				if(Interface.order != CONSTS.ORDER.GALAXY) {
					Interface.sort(CONSTS.ORDER.GALAXY);
				}
			} break;

			default: {
				if(boxPages.includes(newPage)) {
					// Assuming no logic.
				} else {
					console.error("Unhandled path: " + path);
					///TODO some kind of 404?
				}
			}
		}

		clientState.currentPage = newPage;

		// if(state.updating) {
		// 	state.path = path;
		// 	history.pushState(state, 'telephenesis : ' + newPage, path);
		// }
	}

	function open(page) {
		clientState.currentPage = page;

		var pageElement = document.getElementById(page + '-page');
		if(pageElement) {
			clientState.activeWindow = pageElement;
			document.body.appendChild(pageElement);
			Anm.fadeIn(pageElement);
		} else {
			///REVISIT
			console.error("No element for page '" + page + "'");
		}
	}

	///:
	function close(page) {
		page = (typeof page === "undefined") ? clientState.activeWindow : page;

		///:
		// menuToggleElement.innerHTML = '|||';
		// cor.rc(menuToggleElement, 'active');
		// cor.rc(document.getElementById('menu'), 'active');

		console.log(page);
		if(page) {
			switch(page) {
				case 'place': {
					console.log("place");
				} break;

				//default: {
				//}
			}

			Anm.fadeOut(page, 250, function() {
				limbo.appendChild(page);
			});
		}

		clientState.currentPage = false;
		clientState.activeWindow = false;
	}

	function logout() { ///REVISIT placement
		return fetch('/ajax/logout', {
			method: "POST",
			body: {}
		})
			.then(response => response.json())
			.then(result => {
				if(result.errors.length) {
					console.error(result.errors); ///
				} else {
					var loginPageEle = document.getElementById('login-page');
					loginPageEle.children[1].value = "";
					cor.rc(document.body, 'in');
					cor.rc(document.body, 'creator');
				}
			})
			.catch(err => {
				///REVISIT client error handling
				console.error(err);
			});
	}
}
