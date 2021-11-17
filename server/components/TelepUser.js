/**
 * User class for server use.
 * @param [usrDoc] {Object} - Entry in Usr collection which represents this user.
 * @constructor
 */
function TelepUser(usrDoc = false, userMeta = false) { ///REVISIT userMeta architecture
	const me = this;

	const exportLists = {
		identity: [
			'id',
			'email',
			'lv',
			'sessionCode',
			'displayName',
			'creatorName',
			'creationTickets',
			'recreationTickets',
			'bookmarks',
		],

		usrMeta: [
			'userID', ///REVISIT weird architecture relies on converting id to userID sometimes
			'email',
			'displayName',
			'creatorName',
			'creationTickets',
			'recreationTickets',
			'bookmarks',
		],

		client: [
			'email',
			'lv',
			'displayName',
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
		//var proposedValues = {};
		
		if(usrDoc) {
			me.loadData({
				'id': usrDoc.id,
				'lv': usrDoc.lv,
				'email': usrDoc.em,
				'sessionCode': usrDoc.ss,
			});
		}
		//me.loadData(usrDoc);

		if(userMeta) {
			if(userMeta['id']) {
				userMeta['id'] = userMeta.userID; ///REVISIT architecture
			}

			me.loadData(userMeta);
		}

		//me.loadData(proposedValues);

		//console.log(me);
	}

	/**
	 * Safely loads new values and properties into the object by simply
	 * filtering out non-identity props.
	 * @param {object} data - An object of new properties/values to load.
	 **/
	///@TODO initializeProps not currently in use:
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

		///@RE-1 architecture:
		if(exportType == 'usrMeta') {
			if(me.hasOwnProperty('id')) {
				returnObject['userID'] = me['id'];
			}
		}

		return returnObject;
	}

	init(usrDoc, userMeta);
}

module.exports = TelepUser;
