import COR from '../libs/minlab/cor';
import spc from '../libs/minlab/spc';

import clientState from './ClientState';

/**
 * Class of administrator methods.
 * @constructor
 **/
function TelepAdmin() {
	var me = this;

	/**
	 * The star that an administrator is manipulating.
	 * @type {ClientStar}
	 **/
	this.targetStar = null;

	this.init = function() {
		COR.addClassListener('admin-nav', 'click', onAdminLinkClick);
	}

	function onAdminLinkClick(event) {
		event.preventDefault();

		me.targetStar = clientState.actingStar;

		///TODO probably improve architecture; maybe use URL()
		var pathParts = event.target.pathname.split('/');

		// Retrieve operation from path parts (e.g. ['', 'admin', 'moveStar']):
		var operation = pathParts[2];
		if(!operation) {
			operation = 'index';
		}

		switch(operation) {
			case 'index': {
				fetch('/ajax/admin/list-users')
				.then(response => response.json())
				.then(result => {
					var userAdminList = new UserAdminList(result.users);

					var adminListEle = document.querySelector('.user-admin-list');
					adminListEle.replaceWith(userAdminList.element);

				});
			} break;

			case 'moveStar': {
				initializeMove();
			} break;

			case 'recolorStar': {
				initializeRecolor();
			} break;

			case 'deleteStar': {
				confirmDelete();
			} break;

			case 'updateDBSchemas': {
				if(confirm("Update database schema to reflect changes in code?")) {
					COR.POST('/ajax/admin/updateDBSchemas');
				}
			} break;

			default: {
				console.error("Unhandled admin operation: " + operation);
			}
		}
	}

	function initializeMove() {
		COR.ac(clientState.actingStar.element, 'moving');

		///TODO I think it would cleaner maybe to reference like
		//Creation.moveWorkingStarToMouse() rather than place these
		//event listener callbacks right here:

		// Have star follow mouse:
		spc.element.addEventListener('mousemove', mouseMoveStarMove);

		// Add click listener after a delay to prevent accidental clicks:
		setTimeout(() => {
			spc.element.addEventListener('click', clickStarMove);
		}, 200);
	}

	function mouseMoveStarMove(eve) {
		me.targetStar.animateToXY(
			eve.clientX - spc.map.offsetLeft, ///TODO spc should just have properties... shouldnt have to use offsetLeft
			eve.clientY - spc.map.offsetTop,
		);
	}

	function clickStarMove(eve) {
		COR.POST('/ajax/admin/moveStar', {
			starID: clientState.actingStar.publicID,
			x: me.targetStar.position.x,
			y: me.targetStar.position.y,
		});

		clientState.actingStar = null;

		spc.element.removeEventListener('mousemove', mouseMoveStarMove);
		spc.element.removeEventListener('click', clickStarMove);
	}

	//function initializeRecolor() {
		//console.log('recolor');
	//}

	function confirmDelete() {
		if(confirm("Delete the star?")) { ///FUTURE revisit admin ui some day
			COR.POST('/ajax/admin/deleteStar', {
				starID: clientState.actingStar.publicID,
			});
		}
	}
}

class UserAdminList {
	constructor(users) {
		this.users = users;

		this.element = null;

		this.render();
	}

	render() {
		var userRows = [];
		for(var user of this.users) {
			//var userRow = new UserAdminRow(user);
			userRows.push(
				<li>
					<div>{user.email}</div>
					<div>{user.displayName}</div>
					<div>
						{user.creationTickets},
						{user.recreationTickets}
					</div>

					<a class="nav admin-nav" href="/admin/elevate">Elevate Access</a>
					<a class="nav admin-nav" href="/admin/add-ticket">Add Tickets</a>
					<a href="#">Ban</a>
				</li>
			);
		}

		this.element = (
			<ul class="user-admin-list">
				{userRows}
			</ul>
		);
	}
}

class UserAdminRow {
}

export default new TelepAdmin();
