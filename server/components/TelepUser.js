/**
 * User class for server use.
 * @param [usrDoc] {Object} - Entry in Usr collection which represents this user.
 * @constructor
 */
function TelepUser(usrDoc = false, userMeta = false) { ///REVISIT userMeta architecture
	const me = this;

	/* PROPERTIES: */

	/** Properties relevant to import/export. **/
	//const identityProps = [
	//];

	const exportLists = {
		identity: [
			'id',
			'email',
			'sessionCode',
			'displayName',
			'creatorName',
			'creationTickets',
			'recreationTickets',
			'bookmarks',
		],

		commentCache: [
			'id',
			'displayName',
		]
	};

	function init(usrDoc = null, userMeta = null) {
		var proposedValues = {};

		if(usrDoc) {
			proposedValues['id'] = usrDoc.id;
			proposedValues['email'] = usrDoc.em;
			proposedValues['sessionCode'] = usrDoc.ss;
		}

		if(userMeta) {
			userMeta['id'] = userMeta.userID; ///REVISIT architecture
			Object.assign(proposedValues, userMeta);
		}

		me.loadData(proposedValues);

		console.log(me);
	}

	/**
	 * Safely loads new values and properties into the object by simply
	 * filtering out non-identity props.
	 * @param {object} data - An object of new properties/values to load.
	 **/
	this.loadData = function(data, initializeProps = false) {
		for(var identityProp of exportLists.identity) {
			if(data.hasOwnProperty(identityProp)) {
				me[identityProp] = data[identityProp];
			} else {
				if(initializeProps) {
					me[identityProp] = null;
				}
			}
		}
	}

	/**
	 * Convert properties to object for use with database.
	 * @returns {Object}
	 **/
	this.export = function(exportType = 'identity') {
		var returnObject = {};

		for(var prop of exportLists[exportType]) {
			returnObject[prop] = me[prop];
		}

		return returnObject;
	}

	init(usrDoc, userMeta);
}

module.exports = TelepUser;
