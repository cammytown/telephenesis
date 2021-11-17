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
	//var dbUsrMeta = null;

	this.initialize = function(server) {
		dbStars = server.db.collection('MLstars');
		//dbUsrMeta = server.db.collection('usrMeta');
	}

	/**
	 * Updates documents in database to reflect any changes to structure of
	 * Star.
	 * @param {Array.<'stars'|'userMeta'>} schemas
	 * @todo revisit the jsdoc param type syntax for schemas
	 * @returns {Promise<bool>}
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
							var serverStar = new ServerStar(star);
							dbStars.updateOne(
								{ id: star.id },
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
