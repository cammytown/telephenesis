//import Navigation from './Navigation';
//import Nano from 'nano-jsx';
import clientState from '../components/ClientState';

export default new AccountPage();

/**
 * Account editing page.
 * @constructor
 */
function AccountPage() { ///REVISIT element not in use atm
	const me = this;
	var element;

	function init() {
		//me.render();

	}

	this.render = function() {
		///@TODO temporary function to be replaced with below when we move to
		//complete jsx

		if(clientState.user) {
			const accountEmailInput = document.querySelector('#account_email');
			accountEmailInput.value = clientState.user.email;

			const displayNameInput = document.querySelector('#account_display-name');
			displayNameInput.value = clientState.user.displayName;

			var creationTicketCounts = document.querySelectorAll('.creationTickets .count');
			for(var creationTicketCount of creationTicketCounts) {
				creationTicketCount.innerText = clientState.user.creationTickets;
			}

			var recreationTicketCounts = document.querySelectorAll('.recreationTickets .count');
			for(var recreationTicketCount of recreationTicketCounts) {
				recreationTicketCount.innerText = clientState.user.recreationTickets;
			}
		}
	}

	this.renderTODO = function() {
		// Save old element (may not exist):
		var oldElement = me.element;

		//me.element = ();

		if(oldElement) {
			// Already in the DOM; replace previous manifestation:
			oldElement.replaceWith(me.element);
		} else {
			// Not yet in the DOM; add it:
			var playingCommentsEle = document.body.querySelector('div#playingComments ul.comments');
			playingCommentsEle.prepend(me.element); ////TODO IE compatibility for prepend
		}
	}

	init();
}
