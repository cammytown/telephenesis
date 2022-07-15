const stars = require('./StarMapper');
const ServerStar = require('./ServerStar');

module.exports = new AdminMapper();

/**
 * Site administration methods.
 * @constructor
 **/
function AdminMapper() {
	var tlpServer;

	/** Database collection of stars. **/
	var dbStars = null;

	/** Database collection of user information. **/
	var dbUsrMeta = null;

	this.initialize = function(server) {
		tlpServer = server;
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
	 * Retrieve stars from the database for administration views.
	 **/
	this.getStars = function() {
		return dbStars.find()
			.limit(10)
			.toArray()
			.then(stars => {
				return stars;
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
	this.updateDBSchemas = function(schemas = ['stars']) {
		for(var schema of schemas) {
			switch(schema) {
				case 'stars': {
					///REVISIT
					return stars.getStars(false, {})
						.then(stars => {
							stars.forEach(star => {
								///TODO warn about unused properties and implement a param
								//that if set true will remove them:

								// Load data into a ServerStar to initialize data structure:
								var serverStar = new ServerStar(star, 'server');
								dbStars.updateOne(
									{ publicID: star.publicID },
									// Simply set all properties of the star to the newly crafted ServerStar's:
									{ $set: serverStar.export('server') },
								);
							});

						///@TODO probably want to wait til server interaction is
						//actually done before returning:
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

	this.generateDemoStars = async function(user, count = 10) {
		var area = 4000;
		var starInserts = [];

		var currentRootStar = null;
		for(var index = 0; index < count; index++) {
			var newDemoStar = await generateSingleDemoStar(currentRootStar);

			// Randomly assign currentRootStar to the new demoStar:
			if(Math.random() > 0.7) {
				currentRootStar = newDemoStar;

			// Randomly get rid of currentRootStar to start new constellation:
			} else if(Math.random() > 0.5) {
				currentRootStar = null;
			}
		}

		function generateSingleDemoStar(rootStar = null) {
			//var demoStar = new ServerStar();
			//demoStar.publicID = tlpServer.generatePublicID(dbStars);
			var color = ""
				+ parseInt(100 + Math.random() * 100) + ","
				+ parseInt(100 + Math.random() * 100) + ","
				+ parseInt(100 + Math.random() * 100);

			var randomPos;
			var rootStarDistance = 100;
			if(rootStar) {
				randomPos = {
					x: parseInt(rootStar.position.x + (Math.random() * rootStarDistance)) - rootStarDistance/2,
					y: parseInt(rootStar.position.y + (Math.random() * rootStarDistance)) - rootStarDistance/2,
				};
			} else {
				randomPos = {
					x: parseInt(area - (Math.random() * (area))),
					y: parseInt(area - (Math.random() * (area))),
				};
			}

			return stars.initializeStar(user, {
				originStarID: rootStar ? rootStar.publicID : -1,
				color,
				hostType: 'external',
				file: { type: 'audio/mpeg' },
			})
				.then(demoStar => {
					demoStar.title = "Testing Testing 123...";
					demoStar.artist = user.artists[0];

					demoStar.position = randomPos;
					demoStar.color = color;
					//demoStar.isDemo = true;

					//@REVISIT really weird; mostly a quick-fix so it gives us Vector for position...
					demoStar = new ServerStar(demoStar, 'server');
					return stars.actualizeStar(user, demoStar);
				})
				.then(returnObject => {
					//returnObject.newStar.isDemo = true;
					console.log('star inserting');
					//dbStars.insertOne(returnObject.newStar.export('server', ['isDemo']));
					return returnObject.newStar;
				});

			starInserts.push(insertPromise);

			console.log('star loop');

			//stars.insertOne(demoStar.export('server', ['isDemo']));
		}

		return Promise.all(starInserts);
	}
}
