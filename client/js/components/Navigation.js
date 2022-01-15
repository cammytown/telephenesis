import COR from '../libs/minlab/cor';
import spc from '../libs/minlab/spc'; /// relying on implied singleton
//import Anm from '../libs/minlab/anm';
import anime from 'animejs/lib/anime.es';
import HistoryTime from '../libs/history-time';

import clientState from './ClientState';
import tlpInterface from './Interface';
import comments from './Comments';
import Stars from './Stars';
import Creator from './Creator';
import ClientUser from './ClientUser.jsx';
import CONSTS from '../../../abstract/constants';
import telepCommon from '../../../abstract/telepCommon';
import config from '../../../config/telep.config';

import locale from '../../../locale/en_us.json'; //@TODO scaffolding

export default new ClientNavigation();

///TODO consider combining with tlpInterface
/**
 * Handles page transitions and navigation links.
 * @constructor
 **/
function ClientNavigation() {
	var me = this;

	var starContextMenu;
	var galaxyContextMenu;

	var boxPages = [
		'user',
		'login',
		'register',
		'account',
		//'invite',
		'create',
		'recreate',
		'help',
		'terms',
		'admin',
		//'renameStar',
		//'deleteStar',
	];

	var createPages = [
		'create',
		'recreate',
		'place',
		'color',
	];

	var galaxyOrders = Object.values(CONSTS.ORDER);
	var galaxyViews = Object.values(CONSTS.VIEW);

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

			if(tlpInterface.order == CONSTS.ORDER.GALAXY) {
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
		//@REVISIT redundant w/ observePath; revisit architecture of these page
		//change methods...

		var url = new URL(path, window.location.origin); ///@TODO ensure IE support for URL
		var pathParts = url.pathname.split('/');
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
					// No creation tickets; display error:
					tlpInterface.displayError(CONSTS.ERROR.NO_CREATION_TICKETS);
					return false;
				}
			} break;

			case 'recreate': {
				const starID = pathParts[2];

				// Check if user has recreation tickets:
				if(!clientState.recreationTickets) {
					// No recreation tickets; display error:
					tlpInterface.displayError(CONSTS.ERROR.NO_RECREATION_TICKETS);
					return false;
				}
			} break;

			case 'star': {
				const starID = pathParts[2];
				clientState.focusedStar = Stars.clientStars[starID];
			} break;
		}

		const pageTitle = telepCommon.getPageTitle(newPage, clientState.focusedStar, url.searchParams);

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
				{
					// Nothing.
				} break;

				case 'star': {
					clientState.focusedStar = null;
				} break;

				default: {
					if(galaxyOrders.includes(oldPage)) {
						// Navigating away from a galaxy order/view.
						//@REVISIT nothing?
					} else {
						console.error("observePath(): unhandled oldPage '" + oldPage + '"');
					}
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

		//@TODO-1 revisit implementation; probably render on the server for page load:
		var params = url.searchParams;

		//var order = Object.keys(CONSTS.ORDER).indexOf(newPage) == -1
		//    ? CONSTS.ORDER.GALAXY : newPage;
		//var order = params.get('order');

		//var view = params.get('view');

		// If this is not initial page load (and thus we cannot rely on the
		// server having rendered certain things):
		if(!pageInitialization) {
			closeContextMenu();

			preparePathChange(newPage);

			// Open the UI for the page if there is one:
			if(boxPages.includes(newPage)) {
				comments.toggleComments(false);
				me.open(newPage, url);
			}

			// If starting to create a star; change to galaxy view:
			//if(createPages.includes(newPage)) {
			//    tlpInterface.sort(CONSTS.ORDER.GALAXY);
			//}
		}

		// If there's a view or order in the query string:
		//if(order || view) {
		//    // Display the view and/or order:
		//    tlpInterface.sort(order, view);

		//    // Toggle on comments panel.
		//    //@TODO allow people to keep comments panel off
		//    comments.toggleComments(true);
		//} else {
			if(tlpInterface.order != CONSTS.ORDER.GALAXY) {
				//@TODO i think this is more of a quick-fix; a better solution
				//is perhaps to allow urls like
				///star/[starID]?order=most-recent:
				if(newPage != 'star') {
					tlpInterface.sort(CONSTS.ORDER.GALAXY);
				}
			}
		//}

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

				// Begin playback of the star:
				Stars.clientStars[starID].play();

				// Load star comments:
				comments.loadStarComments(Stars.clientStars[starID]);
			} break;

			case 'user': {
				var userID = pathParts[2];
				//@TODO anything?
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
				//var isOrderLink = false;
				//for(var orderKey in CONSTS.ORDER) {
				//    var order = CONSTS.ORDER[orderKey];
				//    if(newPage == order) {
				//        // Navigated to a galaxy order link.
				//        tlpInterface.sort(newPage);
				//        isOrderLink = true;
				//    }
				//}

				// If navigated to a galaxy order:
				if(galaxyOrders.includes(newPage)) {
					var view = params.get('view');

					tlpInterface.sort(newPage, view);
				} else {
					// If link has an associated visual page:
					if(boxPages.includes(newPage)) {
						// Assuming no logic.
					} else {
						console.error("Unhandled path: " + path);
						///TODO some kind of 404?
					}
				}
			}
		}

		clientState.currentPage = newPage;

		// if(state.updating) {
		// 	state.path = path;
		// 	history.pushState(state, 'telephenesis : ' + newPage, path);
		// }
	}

	/**
	 * Open a uiBox.
	 * @param {string} page
	 * @param {string} url
	 **/
	this.open = function(page, url = null, updateState = true) {
		//clientState.currentPage = page;

		//@TODO architecture should revolve around returning a Promise
		var pageElement = document.getElementById(page + '-page');
		if(pageElement) {
			//@TODO-3 display a loader until page is ready

			// Prepare page; fetching data from server if necessary:
			return new Promise(resolve => {
				switch(page) {
					case 'user': {
						//@TODO clean up architecture:
						var userID = url.pathname.split('/')[2];
						fetch('/ajax/user/' + userID, {
							method: "GET",
						})
							.then(response => response.json())
							.then(result => {
								console.log(result);
								var singleUser = new ClientUser(result.user);

								//@TODO quick-fix architecture until we have
								//smarter jsx handling:
								pageElement.replaceWith(singleUser.element);
								pageElement = singleUser.element;
								resolve();
							});
					} break;

					default: {
						resolve();
					}
				}
			})
				.then(() => {
					//@TODO-3 quick-fix; i think ultimately we want a
					//base Page class with methods like .close(); additionally
					//we probably want clientState.activeWindow to be
					//activeWindows (an array) that gets pushed/popped:
					if(updateState) {
						clientState.activeWindow = pageElement;
					}

					document.body.appendChild(pageElement);
					
					anime({
						targets: pageElement,
						duration: config.pageTransitionTime,
						opacity: [0, 1],
						easing: 'linear'
					});

				});
		} else {
			///REVISIT
			console.error("No element for page '" + page + "'");
			return false;
		}
	}

	/**
	 * Close an open page.
	 * @param {Element} [page]
	 **/
	this.close = function(page, updateState = true) {
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

			anime({
				targets: page,
				duration: config.pageTransitionTime,
				opacity: 0,
				easing: 'linear',
				complete: () => { limbo.appendChild(page); }
			});
		}

		//clientState.currentPage = false;
		if(updateState) {
			clientState.activeWindow = null;
		}
	}

	function logout() { ///REVISIT placement; maybe put into a ClientUser
		///@REVISIT technically I suppose we don't even need to ping the server?
		//@REVISIT Prefer or additionally do a loading graphic?:
		tlpInterface.displayMessage("Logging out...");
		return fetch('/ajax/logout', {
			method: "POST",
			body: {}
		})
			.then(response => response.json())
			.then(result => {
				if(result.errors.length) {
					console.error(result.errors); ///
				} else {
					tlpInterface.hideMessage();
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

