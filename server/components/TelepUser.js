/**
 * User class for server use.
 * @param [usrDoc] {Object} - Entry in Usr collection which represents this user.
 * @constructor
 */
function TelepUser(usrDoc = false, usrMeta = false) { ///REVISIT usrMeta architecture
	var me = this;

	/* PROPERTIES: */

	/** Properties relevant to import/export. **/
	var identityProps = [
		"usrID",
		"email",
		"creatorName",
	];

	init(usrDoc);

	function init(usrDoc = false, usrMeta = false) {
		for (var propIndex = 0; propIndex < identityProps.length; propIndex++) {
			var identityProp = identityProps[propIndex];
			me[identityProp] = null;
		}

		if(usrDoc) {
			me["usrID"] = usrDoc.id;
			me["email"] = usrDoc.em;
		}

		if(usrMeta) {
			me["creatorName"] = usrMeta.creatorName;
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
