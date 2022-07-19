/**
 * User class for server use.
 * @param [usrDoc] {object} - Entry in Usr collection which represents this user.
 * @constructor
 **/
function TelepUser(usrDoc = false, userMeta = false) { ///REVISIT userMeta architecture
	const me = this;

	const exportLists = {
		identity: [
			'id', //@TODO replacing with publicID
			'publicID',
			'email',
			'accessLevel',
			'sessionCode',
			'displayName',
			//'creatorName', //@TODO removing
			'artists', //@REVISIT naming
			'creationTickets',
			'recreationTickets',
			'bookmarks',
			'comments',
		],

		usrMeta: [
			'publicID',
			'email',
			'accessLevel', //@REVISIT yes?
			'displayName',
			//'creatorName', //@TODO removing
			'artists',
			'creationTickets',
			'recreationTickets',
			'bookmarks',
			'comments',
		],

		client: [
			'publicID',
			'email',
			'accessLevel',
			'displayName',
			'artists',
			'creationTickets',
			'recreationTickets',
			'bookmarks',
			'comments',
		],

		commentCache: [
			'publicID',
			'displayName',
		]
	};

	function init(usrDoc = null, userMeta = null) {
		//var proposedValues = {};
	
		if(usrDoc) {
			me.loadData({
				'id': usrDoc.id,
				'email': usrDoc.em,
				'sessionCode': usrDoc.ss, //@REVISIT maybe don't always include
			});
		}
		//me.loadData(usrDoc);

		if(userMeta) {
			//if(userMeta['id']) {
			//    userMeta['id'] = userMeta.userID; ///REVISIT architecture
			//}

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
	 * @returns {object}
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
