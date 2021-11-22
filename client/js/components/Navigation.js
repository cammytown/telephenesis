import COR from '../libs/minlab/cor';
import spc from '../libs/minlab/spc'; /// relying on implied singleton
import Anm from '../libs/minlab/anm';
//import anime from 'animejs/lib/anime.es';
import HistoryTime from '../libs/history-time';

import clientState from './ClientState';
import Interface from './Interface';
import comments from './Comments';
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
		COR.addClassListener('nav', 'click', onNavLinkClick);
		COR.addClassListener('ajax', 'click', onAjaxLinkClick);
		COR.addClassListener('close', 'click', onCloseClick);

		// Close context menus when outer space is clicked:
		spc.element.addEventListener('click', function(event) {
			closeContextMenu();

			// Close open boxes if clicking outside of page area:
			//if(event.target.parentNode.id == 'spc' && HistoryTime.state.path != '/') { ///
			//        // state.updating = true;
			//        me.navigate('/'); //// page title
			//}
		});

		// Open context menu on right click
		spc.element.addEventListener('contextmenu', onContextMenu);
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
		}

		observePath(location.href, true);
	}

	function onNavLinkClick(event) {
		event.preventDefault();

		// state.updating = true;

		me.navigate(event.target.pathname); ///// make page titles

		// if(COR.cc(this.parentNode, 'star')) {
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

		var isStarClick = COR.cc(event.target.parentNode, 'star'); ///REVISIT weird architecture?
		if(isStarClick) {
			var starEle = event.target.parentNode;
			var starID = starEle.getAttribute('data-public-id');
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
				bookmarkLink.href = "/remove-bookmark";
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

		//if(clientState.currentPage == newPage) {
		//    return false;
		//}

		// Validate ability to navigate to page:
		///@REVISIT maybe move this switch somewhere else:
		switch(newPage) {
			case 'create': {
				// Check if user has creation tickets:
				if(!clientState.creationTickets) {
					Interface.displayError(CONSTS.ERROR.NO_CREATION_TICKETS);
					return false;
				}
			} break;

			case 'recreate': {
				var starID = pathParts[2];

				// Check if user has recreation tickets:
				if(!clientState.recreationTickets) {
					Interface.displayError(CONSTS.ERROR.NO_RECREATION_TICKETS);
					return false;
				}
			} break;
		}

		// Change page title:
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
			if(oldPage != newPage) {
				me.close();
			}
		} else {
			switch(oldPage) {
				case '':
				case 'star':
				{
					// Nothing.
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
		///@TODO I don't really like using window.location.origin:
		///@TODO store url somewhere in clientState
		var url = new URL(path, window.location.origin); ///@TODO ensure IE support for URL
		var pathParts = url.pathname.split('/');
		var newPage = pathParts[1];

		// If this is not initial page load (and thus we cannot rely on the
		// server having rendered certain things):
		if(!pageInitialization) {
			closeContextMenu();

			preparePathChange(newPage);

			// Open the UI for the page if there is one:
			if(boxPages.includes(newPage)) {
				comments.toggleComments(false);
				open(newPage);
			}

			// If starting to create a star; change to galaxy view:
			if(createPages.includes(newPage)) {
				Interface.sort(CONSTS.ORDER.GALAXY);
			}
		}

		//@TODO-1 revisit implementation; probably render on the server for page load:
		var params = url.searchParams;
		var order = params.get('order');
		var view = params.get('view');

		// If there's a view or order in the query string:
		if(order || view) {
			// Display the view and/or order:
			Interface.sort(order, view);
		} else {
			if(Interface.order != CONSTS.ORDER.GALAXY) {
				Interface.sort(CONSTS.ORDER.GALAXY);
			}
		}

		// Do page-specific things:
		switch(newPage) {
			case 'star': {
				var starID = pathParts[2];

				if(pageInitialization) { ///REVISIT only on pageInit ?
					///REVISIT probably do this on server side; though maybe it's cool
					///TODO change spc over to Vectors probably

					// Center screen around focused star:
					//var obj = { ///@TODO temporary solution
					//    x: spc.x,
					//    y: spc.y
					//};
					//anime({
					//    targets: obj,
					//    x: Stars.clientStars[starID].position.x,
					//    y: Stars.clientStars[starID].position.y,
					//    update: function() {
					//        spc.set(obj.x, obj.y);
					//        Stars.drawLineStep();
					//    }
					//});

					spc.ctr(
						Stars.clientStars[starID].position.x,
						Stars.clientStars[starID].position.y,
						Stars.updateConstellationLines //@TODO-2 revisit hacky solution
					);
				}

				Stars.clientStars[starID].play();
			} break;

			case 'create': {
				Creator.initializeCreation();
			} break;

			case 'recreate': {
				var starID = pathParts[2];
				Creator.initializeCreation(Stars.clientStars[starID]);
			} break;

			case 'bookmark': {
				if(!pageInitialization) {
					limbo.appendChild(starContextMenu); ///REVISIT
					clientState.actingStar.bookmark();
				} else {
					//@TODO-1
				}
			} break;

			case 'remove-bookmark': {
				if(!pageInitialization) {
					limbo.appendChild(starContextMenu);
					clientState.actingStar.removeBookmark();
				} else {
					//@TODO-1
				}
			} break;

			case 'logout': {
				logout().then(() => me.navigate('/'));
			} break;

			case '': { ///REVISIT architecture; should newPage be false for this?
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
		//clientState.currentPage = page;

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

	/**
	 * Close an open page.
	 * @param {Element} [page]
	 **/
	this.close = function(page) {
		page = (typeof page === "undefined") ? clientState.activeWindow : page;

		///:
		// menuToggleElement.innerHTML = '|||';
		// COR.rc(menuToggleElement, 'active');
		// COR.rc(document.getElementById('menu'), 'active');

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

		//clientState.currentPage = false;
		clientState.activeWindow = null;
	}

	function logout() { ///REVISIT placement; maybe put into a ClientUser
		///@REVISIT technically I suppose we don't even need to ping the server?
		return fetch('/ajax/logout', {
			method: "POST",
			body: {}
		})
			.then(response => response.json())
			.then(result => {
				if(result.errors.length) {
					console.error(result.errors); ///
				} else {
					clientState.logout();
				}
			})
			.catch(err => {
				///REVISIT client error handling
				console.error(err);
			});
	}

	function onCloseClick(event) {
		event.preventDefault();
		me.navigate('/');
	}
}

