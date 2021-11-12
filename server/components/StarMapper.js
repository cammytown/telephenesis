////REVISIT not currently in use

const Lame = require('node-lame').Lame;
const fs = require('fs');
const Star = require('../../abstract/Star.js');
const Vector = require('../../abstract/Vector.js');
const ServerStar = require('./ServerStar');

/**
 * Set of methods for creating and editing stars.
 * @constructor
 **/
function StarMapper() {
	var me = this;

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

	var config;

	var MLMeta; ///REVISIT probably removing in favor of a Persistor class

	//var musicPath = __dirname + "/../public/music/";

	/**
	 * Initialize the component.
	 **/
	this.initialize = function(server) {
		///REVISIT the architecture of all these refs. maybe just store server
		//and call stuff on it?

		dbStars = server.db.collection('MLstars');
		dbConstellations = server.db.collection('MLconstellations');
		dbUsrMeta = server.db.collection('usrMeta');
		MLMeta = server.db.collection('MLMeta');

		starCount = server.persistorDoc.starCount;
		constellationCount = server.persistorDoc.constellationCount;
		config = server.config;
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

		return dbStars.find(filter)
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
	 * Create a new star.
	 * @param {Object} user
	 * @param {ServerStar} serverStar
	 **/
	this.createStar = function(user, serverStar) {
		// var defaultObject = {
		// 	originStar: false,
		// 	fileURL: false,
		// 	multerFile: false,
		// };
		// Object.assign();

		if(serverStar.originStarID == -1) {
			if(user.creationTickets <= 0) {
				throw new Error(CONSTS.ERROR.NO_CREATION_TICKETS);
			} else {
				///REVISIT:
				//Users.update(user, {
				dbUsrMeta.updateOne(
					{ userID: user.id },
					{
						$inc: { creationTickets: -1 }
					}
				);

				user.creationTickets -= 1;
			}
		} else {
			if(user.recreationTickets <= 0) {
				throw new Error(CONSTS.ERROR.NO_RECREATION_TICKETS);
			} else {
				///REVISIT:
				//Users.update(user, {
				dbUsrMeta.updateOne(
					{ userID: user.id },
					{
						$inc: { recreationTickets: -1 }
					}
				);

				user.recreationTickets -= 1;
			}
		}


		///TODO future-proof:
		var newStarID = starCount + 1;
		starCount += 1;
		MLMeta.updateOne({ id: "persistors" }, { $inc: {starCount: 1} });

		switch(serverStar.hostType) {
			case 'external': {

			} break;

			case 'upload': {
				var starFileName = "star" + newStarID;
				switch(multerFile.mimetype) {
					case 'audio/aiff':
					case 'audio/wav':
					{
						starFileName += '.mp3';

						const encoder = new Lame({
							"output": musicPath + starFileName,
							"bitrate": 256 //// 320?
						}).setFile('./' + multerFile.path);

						encoder.encode().then(() => {
							console.log('Encoding finished');
						}).catch((error) => {
							console.log(error);
							console.log('Something went wrong');
						});

					} break;

					case 'audio/mpeg':
					case 'audio/mp3': {
						starFileName += '.mp3';
						var target_path = musicPath + starFileName;
						fs.copyFile(multerFile.path, target_path, function(err) {
							if(err) {
								console.log(err);
								///
							}
						});
					} break;

					case 'audio/ogg': {
						/// convert?
						starFileName += '.ogg';
						var target_path = musicPath + starFileName;
						fs.copyFile(multerFile.path, target_path, function(err) {
							if(err) {
								console.log(err);
								///
							}
						});
					} break;

					default: {
						console.warn("WARNING: Didn't know what to do with file of mimetype " + multerFile.mimetype);
					}
				}
			} break;
		}

		serverStar.id = newStarID;

		serverStar.creator = { ///REVISIT architecture?
			_id: user._id,
			creatorName: user.creatorName,
			creatorLink: user.creatorLink,
		};

		var returnObject = {
			starMovements: null,
			newStar: null,
		};

		return me.attemptPlacement(serverStar)
			.then(starMovements => {
				///TODO move this block into a named function somewhere

				returnObject.starMovements = starMovements;

				serverStar.active = true;
				serverStar.position = starMovements[serverStar.id];
				serverStar.timestamp = Date.now();

				// If this is an origin star (first in a constellation).
				if(serverStar.originStarID == -1) { /// is this the check we want??
					// Create a new constellation:
					return createConstellation(newStarID)
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
							// Store some originStar data in the new star for quick reference: ///ARCHITECTURE
							serverStar.originStarID = originStar.id;
							serverStar.constellationID = originStar.constellationID;
							serverStar.tier = originStar.tier + 1;
							return true;
						});
				}
			})
			.then(success => dbStars.insertOne(serverStar))
			.then(result => {
				///TODO my understanding is that result having the document is to be deprecated; must use insertId
				returnObject.newStar = result.ops[0];

				// Return the new star and any star movements that need to occur on the client:
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
		////TODO this is currently a very dumb function, simply randomly checking for stars and
		//// moving directly away from any stars which are too close. This likely can lead to
		//// very inefficient loops where stars are constantly moving back and forth.
		//// Perhaps the answer is pick a point and push stars outward from there, like a ripple.

		if(!position) {
			position = targetStar.position;
		}

		return me.getStars()
			.then(stars => initializeMovementLoop(stars, targetStar, position))
			.then(starMovements => {
				///ARCHITECURE/OPTIMIZATION:

				// Write movements to the server:
				for(starID in starMovements) {
					if(starID == targetStar.id) {
						continue; ///// this assumes that the star we've passed in has not yet been created in the database. rework, probably. at least add a flag
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

			///ARCHITECTURE really not into this; this happens when calling from createStar
			/// because the star isnt actually in the database until we determine its actual position.
			/// Just trying to reduce db calls... maybe just create the star first or even better
			/// perhaps keep a cache of starData in server memory if possible:
			// Add targetStar to starSet if it's not already a member:
			if(starSet.indexOf(targetStar) == -1) {
				starSet.push(targetStar);
			}

			singleAttempt(targetStar, position);

			// Convert to array and round vectors down to ints:
			// var returnArray = [];
			for(var id in starMovements) {
				starMovements[id] = starMovements[id].floor();
				// returnArray.push(starMovements[id].floor());
			}

			return starMovements;

			function singleAttempt(targetStar, newPosition) { ///NAMING
				starMovements[targetStar.id] = newPosition; ///REVISIT

				for(var starIndex = 0; starIndex < starSet.length; starIndex++) {
					var interactingStar = starSet[starIndex];

					if(interactingStar.id == targetStar.id) { ///REVISIT best check?
						console.log('skipping self');
						continue;
					}

					var checkPosition;
					// If we're already moving this star, get it's working position:
					if(starMovements.hasOwnProperty(interactingStar.id)) {
						checkPosition = starMovements[interactingStar.id];
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
		// 	// movingStar.position = starMovements[targetStar.id];
		// }

	}

	/**
	 * Updates documents in database to reflect any changes to structure of
	 * Star.
	 **/
	this.updateDBSchemas = function() {
		///REVISIT
		return me.getStars(false, {})
			.then(stars => {
				stars.forEach(star => {
					///TODO This will remove old properties. We need to be very careful doing that.
					// Maybe make it not do that and have a separate method for examining old
					// properties.

					// Load data into a ServerStar to initialize data structure:
					var serverStar = new ServerStar(star);
					dbStars.updateOne(
						{ id: star.id },
						// Simply set all properties of the star to the newly crafted ServerStar's:
						{ $set: serverStar },
					);

					//if(star.hasOwnProperty(identityProp) == false) {
						//starUpdates
					//}
				});
			});
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

		return dbConstellations.insertOne(newConstellation);
	}
}

module.exports = new StarMapper();

