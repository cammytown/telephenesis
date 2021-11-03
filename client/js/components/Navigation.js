import cor from '../libs/minlab/cor';
import spc from '../libs/minlab/spc'; /// relying on implied singleton
import Anm from '../libs/minlab/anm';
import HistoryTime from '../libs/history-time';

import clientState from './ClientState';
import Stars from './Stars.js';

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
		HistoryTime.bindPathToCallback('*', onNavigate);

		// Add listeners to internal navigation links:
		var navLinks = document.getElementsByClassName('nav'); ///REVISIT not really into this class name; something more descriptive?
		for (var navLinkIndex = 0; navLinkIndex < navLinks.length; navLinkIndex++) {
			navLinks[navLinkIndex].addEventListener('click', onNavLinkClick);
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

		var path = event.target.pathname;
		// state.updating = true;

		me.navigate(path); ///// make page titles

		// if(cor.cc(this.parentNode, 'star')) {
		// 	navigate(path);
		// } else {
		// 	if(state.path == path) navigate('/');
		// 	else navigate(path);
		// }
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
			var sid = starEle.id.split('s')[1];

			//document.getElementById('download').href = '/f/'+sid+'.mp3';
			clientState.actingStar = Stars.clientStars[sid];

			var menu = starContextMenu;
			menu.style.left = parseInt(starEle.style.left) + 12 + 'px';
			menu.style.top = parseInt(starEle.style.top) - 5 + 'px';

			menu.children[1].href = sid+'/recreate';

			spc.map.appendChild(menu);
		} else {
			closeContextMenu();
			clientState.actingStar = false;

			var menu = galaxyContextMenu;
			menu.style.left = event.clientX + 'px';
			menu.style.top = event.clientY + 'px';
			document.body.appendChild(menu);
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

		HistoryTime.navigateTo(path, pageTitle);
	}

	/**
	 * Callback for history state changes.
	 * @param {string} path - The path that the client navigated to.
	 **/
	function onNavigate(path) {
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
				bookmarkStar(clientState.actingStar);
			} break;

			case 'moveStar': {
				initializeMove();
			} break;

			case 'recolorStar': {
				initializeRecolor();
			} break;

			case 'logout': {
				close();
				logout()
					.then(() => me.navigate('/'));
			} break;

			default: {
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
				if(result.error) {
					console.error(result.error); ///
				} else {
					var login = document.getElementById('login');
					login.children[1].value = "";
					cor.rc(document.body, 'in');
					cor.rc(document.body, 'creator');
				}
			});
	}
}
