const Lame = require('node-lame').Lame;
const fs = require('fs');
const Vector = require('../../abstract/Vector.js');

const TelepUser = require('./TelepUser.js');
const ServerStar = require('./ServerStar.js');

const CONSTS = require('../../abstract/constants.js');

module.exports = function TelepAPI(server) {
	var me = this;

	/** Instance of Usr. **/
	var usr;

	/** Connection to the database. **/
	var db;

	/** The loaded Telephenesis config file. **/
	var config;

	/** MongoCollection of constellations. **/
	var constellations;

	/** MongoCollection of stars. **/
	var stars;

	/** MongoCollection of system meta-information. **/
	var MLMeta;

	/** MongoCollection of user profile information. **/
	var usrMeta;

	/** Current number of constellations. **/
	var constellationCount;

	/** Current number of stars. **/
	var starCount;

	/** A path to where uploaded art will be stored on the server. **/
	var musicPath = __dirname + "/../public/music/"; ///MOVE to config

	init();

	function init() {
		usr = server.usr;
		db = server.db;
		config = server.config;
		// me.grr = false;

		constellations = db.collection('MLconstellations');
		stars = db.collection('MLstars');
		MLMeta = db.collection('MLMeta'); /// do we need to filter MLMeta?
		usrMeta = db.collection('usrMeta'); /// do we need to filter MLMeta?

		MLMeta.find({ id: 'persistors' }).limit(1).next(function(err, persistorDoc) {
			if(!persistorDoc) {
				// persistorDoc = {}; /// quick-fix

				////TODO refactor; move this into some kind of database initialization file/method
				MLMeta.insertOne({
					id: 'persistors',
					userIndex: 1,
					constellationCount: 0,
					starCount: 0
				}, function() {
					starCount = 0;
					constellationCount = 0;
				});
			} else {
				// if(persistorDoc.hasOwnProperty("starCount")) {
					starCount = persistorDoc.starCount;
					constellationCount = persistorDoc.constellationCount;
				// } else {
				// 	MLMeta.updateOne({ id: "persistors" }, { $set: { starCount: 0 } });
				// }
			}
		});
	}


	me.syncWithClient = function(serverUpdates) {
		return Promise.all([
			stars.updateMany(
				{ id: { $in: serverUpdates.partialPlay } },
				{ $inc: { partialPlays: 1 } }
			),

			stars.updateMany(
				{ id: { $in: serverUpdates.longPlay } },
				{ $inc: { longPlays: 1 } }
			)
		])
	}

	me.auth = function(level) {
		return function(req, res, next) {
			if(!req.user) {
				res.json({ error: "not logged in" });
				return false; ///
			}

			if(!req.user.lv) {
				res.json({ error: "no creator credentials" });
				return false; ///
			}

			next();
		}
	}

	me.getUserMeta = function(userID, callback) {
		return usrMeta.findOne({ userID })
			.then(doc => {
				if(callback) callback(false, doc);
				return doc;
			})
			.catch(err => {
				console.error(err);
				///
				if(callback) callback(err);
				return false;
			})

			// return doc;
	}

	me.register = function(email, password, creatorName, ip) {
		return usr.rg(email, password, ip)
			.then(usrDoc => {
				var userMetaObject = {
					creatorName: creatorName,
					creationTickets: 1,
					recreationTickets: 3,
					bookmarks: [],
				};

				var newUser = new TelepUser(usrDoc, userMetaObject);

				return usrMeta.insertOne(newUser.export())
					.then(result => {
						return true;
					})
					.catch(err => {
						throw err;
					});
			})
			.catch(err => {
				// o.render('register', { p: req.body, errors: err });
				throw err;
			});
	}

	// me.createProfile = function(profileData, callback) { /// post naming?
	// 	usrMeta.insertOne(profileData, function(err, result) {
	// 		if(err) {
	// 			////
	// 			callback(err);
	// 		}

	// 		callback(err, result);
	// 	});
	// }

	me.updateProfile = function(userID, post, callback) { /// post naming?
		//// if post.email is in use, error

		usrMeta.updateOne(
			{ userID },
			{
				// "email": post.email, //// send confirmation if different
				$set: { "creatorName": post.creatorName }
			},
			callback
		);

		stars.updateMany(
			{ creatorId: userID },
			{ $set: { "creator.creatorName": post.creatorName }}
		); /// no callback
	}

	me.getStars = function(userID = false, cb) {
		// stars.find({ initialized: true }).toArray(function(err, results) {
		return stars.find({ active: true })
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

				if(cb) cb(results);

				return results;
			})
			.catch(err => {
				// console.log(err);
				////
				// cb(err);
				return false;
			});
	}

	me.getStar = function(starId) {
		return stars.findOne({ id: starId })
			.then(doc => {
				if(!doc) {
					throw "Couldn't get star with ID: " + starId;
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

	me.bookmark = function(starID, userID) {
		//return api.getStar(req.body.starID) ///REVISIT do we need to do this validation? do we care?
		//        .then(star => {
				return usrMeta.updateOne(
					{ userID },
					{ $addToSet: { bookmarks: starID } },
					{ upsert: true }, /// remove?
				);
			//})
			//.catch(err => {
			//        throw err;
			//});
	}

	me.removeBookmark = function(starID, userID) {
		return usrMeta.updateOne(
			{ userID },
			{ $pull: { bookmarks: starID } },
		);

	}

	me.recolor = function(starId, rgb, callback) {
		stars.updateOne(
			{ id: starId },
			{ $set: { rgb } },
			callback
		);
	}

	me.move = function(starId, x, y, callback) {
		stars.updateOne(
			{ id: starId },
			{ $set: { x, y } },
			callback
		);
	}

	/**
	 * Creates a new constellation and returns its ID.
	 * @returns {number} - The ID of the constellation.
	 */
	function createConstellation(originStarID) {
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

		return constellations.insertOne(newConstellation);
	}

	me.createStar = function(user, serverStar) {
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
				usrMeta.updateOne(
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
				usrMeta.updateOne(
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
				returnObject.starMovements = starMovements;

				serverStar.active = true;
				serverStar.position = starMovements[serverStar.id];

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
			.then(success => stars.insertOne(serverStar))
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
	 * Attempt to move the star to a position, signaling nearby stars to also move if necessary.
	 * @param targetStar {ServerStar} - The ServerStar containing the proposed position.
	 */
	// this.attemptPosition = function(targetStar, newPosition) { ///REVISIT naming/architecture
	me.attemptPlacement = function(targetStar, position = false) {
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

					stars.updateOne(
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

	me.renameStar = function(starId, creatorName, callback) {
		stars.updateOne(
			{ id: starId },
			{ $set: { creatorName } },
			callback
		);
	}

	me.deleteStar = function(starId, callback) {
		///// probably do some other stuff

		stars.deleteOne(
			{ id: starId },
			callback
		);
	}

	// me.actualize = function(starData, callback) {
	// 	///TODO maybe validate starData structure

	// 	starData.initialized = true;
	// 	// starData.placed = true;

	// 	stars.updateOne(
	// 		{ id: starId },
	// 		{ $set: starData },
	// 		callback
	// 	);
	// }
}
