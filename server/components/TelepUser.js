/**
 * User class for server use.
 * @param [usrDoc] {Object} - Entry in Usr collection which represents this user.
 * @constructor
 */
function TelepUser(usrDoc = false, userMeta = false) { ///REVISIT userMeta architecture
	var me = this;

	/* PROPERTIES: */

	/** Properties relevant to import/export. **/
	var identityProps = [
		'userID',
		'email',
		'sessionCode',
		'creatorName',
		'creationTickets',
		'recreationTickets',
		'bookmarks',
	];

	init(usrDoc, userMeta);

	function init(usrDoc = false, userMeta = false) {
		var userObject = {};

		if(usrDoc) {
			userObject['userID'] = usrDoc.id;
			userObject['email'] = usrDoc.em;
			userObject['sessionCode'] = usrDoc.ss;
		}

		if(userMeta) {
			Object.assign(userObject, userMeta);
		}

		for (var propIndex = 0; propIndex < identityProps.length; propIndex++) {
			var identityProp = identityProps[propIndex];

			if(userObject.hasOwnProperty(identityProp)) {
				me[identityProp] = userObject[identityProp];
			} else {
				me[identityProp] = null;
			}
		}

	}

	/**
	 * Convert properties to object for use with database.
	 * @returns {Object}
	 **/
	me.export = function() {
		var returnObject = {};

		for (var propIndex = 0; propIndex < identityProps.length; propIndex++) {
			var identityProp = identityProps[propIndex];
			returnObject[identityProp] = me[identityProp];
		}

		return returnObject;
	}
}

module.exports = TelepUser;
