////REVISIT not currently in use

const Lame = require('node-lame').Lame;
const fs = require('fs');

const config = require('../../abstract/telep.config')
const Star = require('../../abstract/Star');
const Vector = require('../../abstract/Vector');
const ServerStar = require('./ServerStar');
const uploads = require('./UploadMapper');

/**
 * Set of methods for creating and editing stars.
 * @constructor
 **/
function StarMapper() {
	var me = this;

	//@REVISIT architecture:
	var server = null;

	/** Database collection of stars. **/
	var dbStars = null;

	/** MongoCollection of constellations. **/
	var dbConstellations;

	/** Database collection of user information. **/
	var dbUsrMeta = null;

	/** Current number of stars. **/
	var starCount;

	/** Current number of constellations. **/
	var constellationCount;

	var MLMeta; ///REVISIT probably removing in favor of a Persistor class

	//var musicPath = __dirname + "/../public/music/";

	/**
	 * Initialize the component.
	 **/
	this.initialize = function(serverInput) {
		///REVISIT the architecture of all these refs. maybe just store server
		//and call stuff on it?

		server = serverInput;
		dbStars = server.db.collection('MLstars');
		dbConstellations = server.db.collection('MLconstellations');
		dbUsrMeta = server.db.collection('usrMeta');
		MLMeta = server.db.collection('MLMeta');

		starCount = server.persistorDoc.starCount;
		constellationCount = server.persistorDoc.constellationCount;
	}

	/**
	 * Retrieve a single star by its ID.
	 * @param {number} starID
	 **/
	me.getStar = function(starID) {
		return dbStars.findOne({ id: starID })
			.then(doc => {
				if(!doc) {
					throw "Couldn't get star with ID: " + starID;
				}

				var creationDate = new Date(doc._id.getTimestamp());
				doc.timestamp = creationDate.getTime(); // Convert Date to unix timestamp
				return doc;
			})
			.catch(err => {
				///REVISIT throwing new Error every time means we might be doing new Error(Error); not sure how to architect:
				throw new Error(err);
			});
	}

	/**
	 * Retrieve active stars from the database.
	 * @param userID - The user retrieving stars.
	 * @todo Filtering parameters.
	 **/
	this.getStars = function(userID = false, filter = { active: true }) {
		// stars.find({ initialized: true }).toArray(function(err, results) {

		var generalFilter = { deleted: { $ne: true } };
		filter = Object.assign(generalFilter, filter);

		return dbStars
			.find(filter)
			.sort({ longPlays: -1 })
			// .then(mongoCursor => mongoCursor.toArray)
			// .then(results => {
			.toArray()
			.then(results => {
				results.forEach(document => { ///ARCHITECTURE create some kind of decorator method probably:
					var creationDate = new Date(document._id.getTimestamp());
					document.timestamp = creationDate.getTime(); // Convert Date to unix timestamp
					document.position = new Vector(document.position.x, document.position.y);
				});

				return results;
			})
			.catch(err => {
				throw err;
			});
	}

	/**
	 * Prepares a star for actualization; preparing publicID and, if needed, an
	 * upload URL.
	 * @param {object} user
	 * @param {starData} starData
	 **/
	this.initializeStar = function(user, starData) {
		///TODO future-proof:
		//var newStarID = starCount + 1;
		//starCount += 1;
		//MLMeta.updateOne({ id: "persistors" }, { $inc: {starCount: 1} });
		//serverStar.publicID = newStarID;

		//var serverStar = new ServerStar(starData, 'clientInit'); //@TODO
		var serverStar = new ServerStar();
		serverStar.originStarID = starData.originStarID;
		serverStar.hostType = starData.hostType;

		return server.generatePublicID(dbStars)
			.then(publicID => {
				serverStar.publicID = publicID;

				serverStar.creator = { //@TODO-2 move to .export architecture
					_id: user._id,
					creatorName: user.creatorName,
					creatorLink: user.creatorLink,
				};

				// Generate uploadURL if necessary:
				return new Promise(resolve => { //@REVISIT architecture
					if(serverStar.hostType == 'upload') {
						if(server.serverConfig.storage.provider == 'local') {
							//@TODO-1 implement
							throw "Telephenesis: local storage not implemented yet";
						}

						uploads.requestUploadURL(serverStar)
							.then(uploadURL => {
								serverStar.uploadURL = uploadURL;
								resolve()
							});
					} else {
						resolve();
					}

				})
					.then(() => dbStars.insertOne(serverStar.export(['uploadURL'])))
					.then(result => { return serverStar; });
			});

	}

	/**
	 * Create a new star.
	 * @param {object} user
	 * @param {ServerStar} serverStar
	 **/
	this.actualizeStar = function(user, serverStar) {

		var returnObject = {
			newStar: null,
			starMovements: null,
		};

		//@TODO clean this block up by making an actualizePosition,
		//actualizeInsertion

		// Actualize position of star and shift any nearby stars:
		return me.attemptPlacement(serverStar)
			.then(starMovements => {
				///TODO move this block into a named function somewhere

				returnObject.starMovements = starMovements;

				serverStar.active = true;
				serverStar.position = starMovements[serverStar.publicID];
				serverStar.timestamp = Date.now();

				// If this is an origin star (first in a constellation).
				if(serverStar.originStarID == -1) { /// is this the check we want??
					// Create a new constellation:
					return createConstellation(serverStar.publicID)
						.then(newConstellationID => {
							// Update star data to reflect new constellation:
							serverStar.constellationID = newConstellationID;
							serverStar.tier = 0;
							return true;
						});


				// Else this is a recreation of a star:
				} else {
					// Get original star:
					return me.getStar(serverStar.originStarID)
						.then(originStar => {
							// Store originStar data in new star for quick
							// reference:
							///ARCHITECTURE
							serverStar.originStarID = originStar.publicID;
							serverStar.constellationID = originStar.constellationID;
							serverStar.tier = originStar.tier + 1;
							return true;
						});
				}
			})
			.then(success => {
				if(serverStar.hostType == 'upload') {
					serverStar.uploadURL = null;
					serverStar.fileURL = server.serverConfig.storage.servingUrl
						+ 'star-' + serverStar.publicID;

					//@TODO-4 ensure user is authorized to manipulate star...
					// Star should have been initialized in the database when
					// upload was started:
					return dbStars.updateOne(
						{ publicID: serverStar.publicID },
						{ $set: serverStar.export(
							[
								'active',
								'deleted',
								'uploadURL',
							])
						}
					);
				} else {

					// This should be the server's first encounter with the
					// star; generate a publicID:
					//return server.generatePublicID(dbStars)
					return me.initializeStar(user, serverStar)
						.then(serverStar => {
							dbStars.insertOne(serverStar.export(['active', 'deleted']))
						});
				}
			})
			.then(result => {
				// Update user creation tickets:
				//@REVISIT expendUserTicket() is async-- do we want to make
				//sure they happen before proceeding?:
				if(serverStar.originStarID == -1) {
					expendUserTicket(user, 'creation');
				} else {
					expendUserTicket(user, 'recreation');
				}

				//TODO filter return:
				returnObject.newStar = serverStar.export();

				// Return the new star and any star movements that need to
				// occur on the client:
				return returnObject;
			})
			.catch(err => {
				///REVISIT:
				console.error(err);
				throw err;
			});
	}

	/**
	 * Move a star to a new position.
	 * @param {number} starID
	 * @param {number} x
	 * @param {number} y
	 **/
	this.moveStar = function(starID, x, y) {
		if(typeof starID !== 'number') throw "No starID.";
		if(typeof x !== 'number') throw "No x provided.";
		if(typeof y !== 'number') throw "No y provided.";

		return dbStars.updateOne(
			{ id: starID },
			{ $set: { position: { x, y } } } ///REVISIT ugly
		);
	}

	this.deleteStar = function(starID) {
		/////TODO probably do some other stuff
		// like if this is a root star for other stars,
		// what should we do?

		return dbStars.updateOne(
			{ id: starID },
			{ $set: { deleted: true } } ///TODO some process of clearing phantoms that will never be used/seen again
		);

		//return dbStars.deleteOne(
			//{ id: starID },
		//);
	}

	/**
	 * Attempt to move the star to a position, signaling nearby stars to also move if necessary.
	 * @param targetStar {ServerStar} - The ServerStar containing the proposed position.
	 */
	this.attemptPlacement = function(targetStar, position = false) {
		////TODO this is currently a very dumb function, simply randomly
		//checking for stars and moving directly away from any stars which are
		//too close. This likely can lead to very inefficient loops where stars
		//are constantly moving back and forth.  Perhaps the answer is pick a
		//point and push stars outward from there, like a ripple.

		if(!position) {
			position = targetStar.position;
		}

		return me.getStars()
			.then(stars => initializeMovementLoop(stars, targetStar, position))
			.then(starMovements => {
				///ARCHITECURE/OPTIMIZATION:

				// Write movements to the server:
				for(starID in starMovements) {
					if(starID == targetStar.publicID) {
						///// this assumes that the star we've passed in has
						//not yet been created in the database. rework,
						//probably. at least add a flag:
						continue;
					}

					var newPosition = starMovements[starID];

					dbStars.updateOne(
						{ id: parseInt(starID) },
						{ $set: { "position": newPosition } }
					)
						.then(result => {
							if(!result.modifiedCount) {
								console.error("Couldn't reposition star for some reason."); ///
							}
						})
						.catch(errors => {
							console.log("??");
							console.log(errors);
							throw errors;
						});
				}

				return starMovements;
			});

		function initializeMovementLoop(starSet, targetStar, position) { ///NAMING
			var starMovements = {};

			///ARCHITECTURE really not into this; this happens when calling
			//from actualizeStar / because the star isnt actually in the
			//database until we determine its actual position.  / Just trying
			//to reduce db calls... maybe just create the star first or even
			//better / perhaps keep a cache of starData in server memory if
			//possible: Add targetStar to starSet if it's not already a member:
			if(starSet.indexOf(targetStar) == -1) {
				starSet.push(targetStar);
			}

			singleAttempt(targetStar, position);

			// Convert to array and round vectors down to ints:
			// var returnArray = [];
			for(var starPublicID in starMovements) {
				starMovements[starPublicID] = starMovements[starPublicID].floor();
				// returnArray.push(starMovements[id].floor());
			}

			return starMovements;

			function singleAttempt(targetStar, newPosition) { ///NAMING
				starMovements[targetStar.publicID] = newPosition; ///REVISIT

				for(var starIndex = 0; starIndex < starSet.length; starIndex++) {
					var interactingStar = starSet[starIndex];

					if(interactingStar.publicID == targetStar.publicID) { ///REVISIT best check?
						console.log('skipping self');
						continue;
					}

					var checkPosition;
					// If we're already moving this star, get it's working position:
					if(starMovements.hasOwnProperty(interactingStar.publicID)) {
						checkPosition = starMovements[interactingStar.publicID];
					// First time observing this star in the method call, use it's current position.
					} else {
						checkPosition = interactingStar.position;
					}

					// Get distance between stars:
					var differenceVector = newPosition.subtract(checkPosition);
					var starDistance = differenceVector.getMagnitude();

					if(starDistance == 0) {
						console.log(targetStar);
						console.log(interactingStar);
						throw "yeah okay";
					}

					// If star is too close and adjustments must be made:
					if(starDistance < config.starSpacing) {
						// console.log(differenceVector);
						const marginExcess = config.starSpacing - starDistance;

						// Move this interactingStar away from targetStar:
						var interactingStarMovement = differenceVector.normalize().scale(-1 * (marginExcess + 10)/2);
						singleAttempt(interactingStar, checkPosition.add(interactingStarMovement));

						// Move targetStar away from clientStar:
						var targetStarMovement = differenceVector.normalize().scale((marginExcess + 10)/2);
						singleAttempt(targetStar, newPosition.add(targetStarMovement));
					}
				}
			}
		}

		// for (var starIndex = 0; starIndex < starMovements.length; starIndex++) {
		// 	var movingStar = starMovements[starIndex];
		// 	// movingStar.position = starMovements[targetStar.publicID];
		// }

	}

	/**
	 * Creates a new constellation and returns its ID.
	 * @returns {number} - The ID of the constellation.
	 */
	function createConstellation(originStarID) { ///REVISIT placement?
		///REVISIT we just assume this function successfully interacts with the datase.
		/// We probably need to take some measures to ensure the constellation has in fact
		/// been created.
		var newConstellationID = constellationCount + 1;
		constellationCount += 1;
		MLMeta.updateOne({ id: "persistors" }, { $inc: { constellationCount: 1 } });

		var newConstellation = {
			id: newConstellationID,
			starIDs: [originStarID],
		};

		return dbConstellations.insertOne(newConstellation)
			.then(result => {
				return newConstellationID;
			})
			.catch(err => {
				throw err;
			});
	}

	function expendUserTicket(user, ticketType) { //@TODO move somewhere else
		switch(ticketType) {
			case 'creation': {
				if(user.creationTickets <= 0) {
					throw new Error(CONSTS.ERROR.NO_CREATION_TICKETS);
				} else {
					///REVISIT:
					//Users.update(user, {
					dbUsrMeta.updateOne(
						{ userID: user.id },
						{ $inc: { creationTickets: -1 } }
					);

					user.creationTickets -= 1;
				}
			} break;

			case 'recreation': {
				if(user.recreationTickets <= 0) {
					throw new Error(CONSTS.ERROR.NO_RECREATION_TICKETS);
				} else {
					///REVISIT:
					//Users.update(user, {
					dbUsrMeta.updateOne(
						{ userID: user.id },
						{ $inc: { recreationTickets: -1 } }
					);

					user.recreationTickets -= 1;
				}
			} break;

			default: {
				throw "expendUserTicket(): unhandled ticketType " + ticketType;
			}
		}
	}
}

module.exports = new StarMapper();

