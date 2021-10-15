import cor from '../libs/minlab/cor';
import spc from '../libs/minlab/spc'; /// relying on implied singleton
import Anm from '../libs/minlab/anm';
import HistoryTime from '../libs/history-time';

import clientState from './ClientState';

export default new ClientNavigation();

function ClientNavigation() {
	var starContextMenu;
	var galaxyContextMenu;

	this.init = function() {
		starContextMenu = document.getElementById('starContextMenu');
		galaxyContextMenu = document.getElementById('galaxyContextMenu');

		// Listen for URI changes
		HistoryTime.bindPathToCallback('*', navigate);

		// Listen to internal navigation links
		var navLinks = document.getElementsByClassName('nav'); ///REVISIT not really into this class name; something more descriptive?
		for (var navLinkIndex = 0; navLinkIndex < navLinks.length; navLinkIndex++) {
			navLinks[navLinkIndex].addEventListener('click', onNavLinkClick);
		}

		// Close context menus when outer space is clicked
		cor.al(spc.element, 'click', function(event) {
			closeContextMenu();

			if(event.target.parentNode.id == 'spc' && HistoryTime.state.path != '/') { ///
				// state.updating = true;
				HistoryTime.navigateTo('/', "Telephenesis"); //// page title
			}
		});

		// Open context menu on right click
		cor.al(spc.element, 'contextmenu', contextMenu);
	}

	function onNavLinkClick(event) {
		event.preventDefault();

		var path = event.target.pathname;
		// state.updating = true;

		HistoryTime.navigateTo(path, "Telephenesis"); ///// make page titles

		// if(cor.cc(this.parentNode, 'star')) {
		// 	navigate(path);
		// } else {
		// 	if(state.path == path) navigate('/');
		// 	else navigate(path);
		// }
	}

	function contextMenu(e) {
		e.preventDefault();
		e.stopPropagation();

		closeContextMenu();

		var isStarClick = cor.cc(e.target.parentNode, 'star'); ///REVISIT weird architecture?
		if(isStarClick) {
			var star = e.target.parentNode;
			var sid = star.id.split('s')[1];

			//document.getElementById('download').href = '/f/'+sid+'.mp3';
			clientState.actingStar = star;


			var menu = starContextMenu;
			menu.style.left = parseInt(star.style.left) + 12 + 'px';
			menu.style.top = parseInt(star.style.top) - 5 + 'px';

			menu.children[1].href = sid+'/recreate';

			spc.map.appendChild(menu);
		} else {
			closeContextMenu();
			clientState.actingStar = false;

			var menu = galaxyContextMenu;
			menu.style.left = e.clientX + 'px';
			menu.style.top = e.clientY + 'px';
			document.body.appendChild(menu);
		}
	}

	// VISUAL FUNCTIONS
	function closeContextMenu() {
		// var menus = document.getElementsByClassName('star menu');
		// if(menus.length) menus[0].className = 'star';
		limbo.appendChild(starContextMenu);
		limbo.appendChild(galaxyContextMenu);
	}

	function navigate(path) {
		var parts = path.split('/');
		var operation = parts[1];

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

			// case '': {

			// } break;

			case 'bookmark': {
				bookmarkStar(clientState.actingStar);
				return true;
			} break;

			case 'moveStar': {
				initializeMove();
				return true;
			} break;

			case 'recolorStar': {
				initializeRecolor();
				return true;
			} break;

			case 'logout': {
				close();
				logout()
					.then(() => HistoryTime.navigateTo('/'));

				return true;
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

		function open(box) {
			var box = document.getElementById(box);
			clientState.activeWindow = box;
			document.body.appendChild(box);
			Anm.fadeIn(box);
			// spc.flt(true);
		}

		///:
		function close(box) {
			box = (typeof box === "undefined") ? clientState.activeWindow : box;
			clientState.activeWindow = false;

			///:
			// menuToggleElement.innerHTML = '|||';
			// cor.rc(menuToggleElement, 'active');
			// cor.rc(document.getElementById('menu'), 'active');

			if(box) {
				Anm.fadeOut(box, 250, function() {
					limbo.appendChild(box);
				});
			}

			// spc.flt(false);
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
}