import cor from '../libs/minlab/cor';
import spc from '../libs/minlab/spc'; /// relying on implied singleton
import Anm from '../libs/minlab/anm';
import HistoryTime from '../libs/history-time';

import clientState from './ClientState';
import Interface from './Interface';
import Stars from './Stars.js';
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

	this.init = function() {
		// Setup element references:
		starContextMenu = document.getElementById('starContextMenu');
		galaxyContextMenu = document.getElementById('galaxyContextMenu');

		// Set activeWindow if path calls for it:
		///REVISIT architecture:
		var page = location.pathname.split('/')[1];
		var initialPage = document.getElementById(page + '-page');
		clientState.activeWindow = initialPage;

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
			var starID = starEle.id.split('s')[1];
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

			starContextMenu.style.left = clientStar.position.x + 12 + 'px';
			starContextMenu.style.top = clientStar.position.y - 5 + 'px';

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
		var parts = path.split('/');
		var operation = parts[1];

		var pageTitle = "telephenesis";
		if(operation) {
			pageTitle += ' : ' + operation;
		}

		// Pass state handling to HistoryTime:
		HistoryTime.navigateTo(path, pageTitle);
	}

	/**
	 * Manipulates the page state according to the path.
	 * @param {string} path - The path that the client navigated to.
	 **/
	function observePath(path) {
		var parts = path.split('/');
		var operation = parts[1];
		console.log(operation);

		// if(operation.length && !isNaN(operation)) {
		// 	var star = document.getElementById('s'+operation)
		// 	playStar(star);
		// 	// if(state.path == path) return true;

		// } else switch(operation) {
		switch(operation) {
			/// TODO: refactor:
			case 'login':
			case 'register':
			case 'settings':
			case 'invite':
			case 'create':
			case 'recreate':
			case 'renameStar':
			case 'deleteStar':
			case 'help':
			{
				closeContextMenu(); ///
				close();
				open(operation);
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
				close();
				logout()
					.then(() => me.navigate('/'));
			} break;

			case '': { ///REVISIT architecture; should operation be false for this?
				if(Interface.order != CONSTS.ORDER.GALAXY) {
					Interface.sort(CONSTS.ORDER.GALAXY);
				}

				close();
			} break;

			default: {
				console.error("Unhandled path: " + path);
				///TODO some kind of 404?
				close();

				// spc.flt(false);
				// spc.s = 'active';
			}
		}

		// if(state.updating) {
		// 	state.path = path;
		// 	history.pushState(state, 'telephenesis : ' + operation, path);
		// }
	}

	function open(page) {
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

		if(page) {
			Anm.fadeOut(page, 250, function() {
				limbo.appendChild(page);
			});
		}

		clientState.activeWindow = false;
	}

	function logout() { ///REVISIT placement
		return fetch('/ajax/logout', {
			method: "POST",
			body: {}
		})
			.then(response => response.json())
			.then(result => {
				if(result.errors) {
					console.error(result.errors); ///
				} else {
					var login = document.getElementById('login');
					login.children[1].value = "";
					cor.rc(document.body, 'in');
					cor.rc(document.body, 'creator');
				}
			});
	}
}
