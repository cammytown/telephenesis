import stars from './Stars';
export default ClientUser;

/**
 * Class representing logged-in user on the client.
 * @param {object} initializationData
 * @constructor
 */
function ClientUser(initializationData) {
	var me = this;

	const identityProps = [
		'email',
		'lv',
		'displayName',
		'creationTickets',
		'recreationTickets',
		'bookmarks',
	];

	/**
	 * The user's bookmarks.
	 * @type {Array.<ClientStar>}
	 **/
	this.bookmarks = [];

	init();

	function init() {
		///@TODO consider having a shared User class between server and client
		//as we do with Star
		if(initializationData) {
			for(var identityProp of identityProps) {
				if(initializationData.hasOwnProperty(identityProp)) {
					switch(identityProp) {
						case 'bookmarks': {
							for(var bookmarkedStarID of initializationData['bookmarks']) {
								var bookmarkedStar = stars.clientStars[bookmarkedStarID];
								me.bookmarks.push(bookmarkedStar);
							}
						} break;

						default: {
							me[identityProp] = initializationData[identityProp];
						}
					}
				}
			}
		}
	}
}
