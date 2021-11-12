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
		var adminLinks = document.querySelectorAll('a.admin');
		adminLinks.forEach(adminLink => {
			adminLink.addEventListener('click', onAdminLinkClick);
		});
	}

	function onAdminLinkClick(event) {
		event.preventDefault();

		me.targetStar = clientState.actingStar;

		///TODO probably improve architecture; maybe use URL()
		var operation = event.target.pathname.split('/')[1];
		switch(operation) {
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
		me.targetStar.moveToXY(
			eve.clientX - spc.map.offsetLeft, ///TODO spc should just have properties... shouldnt have to use offsetLeft
			eve.clientY - spc.map.offsetTop,
		);
	}

	function clickStarMove(eve) {
		COR.POST('/ajax/admin/moveStar', {
			starID: clientState.actingStar.id,
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
				starID: clientState.actingStar.id,
			});
		}
	}
}

export default new TelepAdmin();
