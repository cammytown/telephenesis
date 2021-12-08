const stars = require('./StarMapper');

module.exports = new AdminMapper();

/**
 * Site administration methods.
 * @constructor
 **/
function AdminMapper() {
	/** Database collection of stars. **/
	var dbStars = null;

	/** Database collection of user information. **/
	var dbUsrMeta = null;

	this.initialize = function(server) {
		dbStars = server.db.collection('MLstars');
		dbUsrMeta = server.db.collection('usrMeta');
	}

	/**
	 * Retrieve users from the database for administration views.
	 **/
	this.getUsers = function() {
		return dbUsrMeta.find()
			.limit(10)
			.toArray()
			.then(users => {
				return users;
			});
	}

	/**
	 * Changes a user access level.
	 * @todo rename since you might decrease the level
	 * @param {number} userPublicID - The public ID of the user to change.
	 * @param {number} newLevel - The access level to set the user to.
	 * @returns Promise;
	 **/
	this.elevateUser = function(userPublicID, newLevel) {
		console.log('elevating userPublicID ' + userPublicID + ' to level ' + newLevel);
		return dbUsrMeta.updateOne(
			{ publicID: userPublicID },
			{ $set: { accessLevel: newLevel } }
		);
	}

	/**
	 * Sets the number of creation/recreation tickets a user has.
	 * @param {number} userPublicID - The public ID of the user to change.
	 * @param {number} creationTicketCount
	 * @param {number} recreationTicketCount
	 * @returns Promise;
	 **/
	this.setUserTicketCount = function(
		userPublicID,
		creationTicketCount,
		recreationTicketCount
	) {
		return dbUsrMeta.updateOne(
			{ publicID: userPublicID },
			{ $set: {
				creationTickets: creationTicketCount,
				recreationTickets: recreationTicketCount
			} }
		);
	}

	/**
	 * Updates documents in database to reflect any changes to structure of
	 * Star.
	 * @param {Array.<'stars'|'userMeta'>} schemas
	 * @todo revisit the jsdoc param type syntax for schemas
	 * @returns {Promise<boolean>}
	 **/
	this.updateDBSchemas = function(schemas = []) {
		for(var schema of schemas) {
			switch(schema) {
				case 'stars': {
					///REVISIT
					stars.getStars(false, {})
					then(stars => {
						stars.forEach(star => {
							///TODO warn about unused properties and implement a param
							//that if set true will remove them:

							// Load data into a ServerStar to initialize data structure:
							var serverStar = new ServerStar(star, 'server');
							dbStars.updateOne(
								{ id: star.publicID },
								// Simply set all properties of the star to the newly crafted ServerStar's:
								{ $set: serverStar.export('identity') },
							);
						});

						///@TODO probably want to wait til server interaction is
						//actually done before returning:
						return true;
					});
				} break;

				//case 'userMeta': {
				//} break;

				default: {
					const err = "updateDBSchemas(): Unhandled schema '"
						+ schema + "'";

					console.error(err);
					throw err;
				}
			}
		}
	}
}
