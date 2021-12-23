import COR from '../libs/minlab/cor';
import spc from '../libs/minlab/spc';

import clientState from './ClientState';
import tlpInterface from './Interface';

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

				//@TODO consolidate w/ above probably
				fetch('/ajax/admin/list-stars')
					.then(response => response.json())
					.then(result => {
						var starAdminList = new StarAdminList(result.stars);
						var starListEle = document.querySelector('.star-admin-list');
						starListEle.replaceWith(starAdminList.element);
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

			case 'elevate': {
				var newLevel = parseInt(prompt('Choose a new level for the user'));
				if(isNaN(newLevel)) {
					console.error('Invalid level'); ///
					return false;
				}

				const userPublicID = pathParts[3];
				if(confirm('Set user ' + userPublicID + ' access level to ' + newLevel + '?')) {
					COR.POST('/ajax/admin/elevate-user', {
						userPublicID,
						newLevel
					})
						.then(response => response.json())
						.then(result => {
							if(result.errors.length) {
								//@REVISIT
								throw result.errors.length;
							}

							tlpInterface.displayMessage('User elevated.');
						});
				}
			} break;

			case 'set-ticket-count': {
				var creationTicketCount = prompt("How many creation tickets should this user have?");
				var recreationTicketCount = prompt("Recreation tickets?");
				if(confirm("Setting user tickets to "
					+ creationTicketCount + " creation tickets and "
					+ recreationTicketCount + " recreation tickets. Confirm?"
				)) {
					const userPublicID = pathParts[3];
					COR.POST('/ajax/admin/set-user-ticket-count', {
						userPublicID,
						creationTicketCount,
						recreationTicketCount
					})
						.then(response => response.json())
						.then(result => {
							if(result.errors.length) {
								//@REVISIT
								throw result.errors;
							}

							tlpInterface.displayMessage('User ticket count has been set.');
						});
				}

			} break;

			case 'update-db-schemas': {
				if(confirm("Update database schema to reflect changes in code?")) {
					COR.POST('/ajax/admin/update-db-schemas');
				}
			} break;

			case 'generate-demo-stars': {
				if(confirm("Generate demo stars?")) {
					COR.POST('/ajax/admin/generate-demo-stars');
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

class StarAdminList {
	constructor(stars) {
		this.stars = stars;

		this.element = null;

		this.render();
	}

	render() {
		var userRows = [];
		for(var star of this.stars) {
			//var userRow = new UserAdminRow(user);
			userRows.push(
				<li>
					<div>{star.title}</div>
					<div>{star.artist.name}</div>
					<div>{star.partialPlays}</div>
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
					<div class="more-info">
						<div>{user.displayName}</div>
						<div>Access Level - {user.accessLevel}</div>
						<div>
							{user.creationTickets} creation tickets,<br />
							{user.recreationTickets} recreation tickets
						</div>

						<a
							class="nav admin-nav"
							href={"/admin/elevate/" + user.publicID}
						>
							Elevate Access
						</a>

						<a
							class="nav admin-nav"
							href={"/admin/set-ticket-count/" + user.publicID}
						>
							Set Ticket Count
						</a>

						<a href="#">Ban</a>
					</div>
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
