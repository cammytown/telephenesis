const Lame = require('node-lame').Lame;
const fs = require('fs');

const ServerStar = require('./ServerStar.js');

module.exports = function(db) {
	var constellations = db.collection('MLconstellations');
	var stars = db.collection('MLstars');

	var me = this;

	var musicPath = __dirname + "/../public/music/";

	me.grr = false;

	///:
	var MLMeta = db.collection('MLMeta'); /// do we need to filter MLMeta?
	var usrMeta = db.collection('usrMeta'); /// do we need to filter MLMeta?
	var constellationCount;
	var planetCount;
	MLMeta.find({ id: 'persistors' }).limit(1).next(function(err, persistorDoc) {
		if(!persistorDoc) {
			// persistorDoc = {}; /// quick-fix

			////TODO refactor; move this into some kind of database initialization file/method
			MLMeta.insertOne({
				id: 'persistors',
				userIndex: 1,
				constellationCount: 0,
				planetCount: 0
			}, function() {
				planetCount = 0;
				constellationCount = 0;
			});
		} else {
			// if(persistorDoc.hasOwnProperty("planetCount")) {
				planetCount = persistorDoc.planetCount;
				constellationCount = persistorDoc.constellationCount;
			// } else {
			// 	MLMeta.updateOne({ id: "persistors" }, { $set: { planetCount: 0 } });
			// }
		}
	});

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

	me.getUsrMeta = function(userID, callback) {
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

	me.createProfile = function(profileData, callback) { /// post naming?
		usrMeta.insertOne(profileData, function(err, result) {
			if(err) {
				////
				callback(err);
			}

			callback(err, result);
		});
	}

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
				results.forEach(document => {
					var creationDate = new Date(document._id.getTimestamp());
					document.timestamp = creationDate.getTime(); // Convert Date to unix timestamp
				} );

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

	me.getStar = function(starId, callback) {
		return stars.findOne({ id: starId })
			.then(doc => {
				var creationDate = new Date(doc._id.getTimestamp());
				doc.timestamp = creationDate.getTime(); // Convert Date to unix timestamp
				return doc;
			})
			.catch(err => {
				if(callback) callback(err);
				throw new Error(err);
			});
	}

	me.bookmark = function(star, userID, callback) {
		usrMeta.updateOne(
			{ userID },
			{ $addToSet: { bookmarks: star.id } },
			{ upsert: true },
			callback
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

	me.createStar = function(userID, serverStar, callback) {
		// var defaultObject = {
		// 	originStar: false,
		// 	fileURL: false,
		// 	multerFile: false,
		// };
		// Object.assign();

		var newStarID = planetCount + 1;
		planetCount += 1;
		MLMeta.updateOne({ id: "persistors" }, { $inc: {planetCount: 1} });

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

		// Get creator information:
		return me.getUsrMeta(userID)
			.then(usrMeta => {
				serverStar.id = newStarID;

				serverStar.creator = { ///REVISIT architecture?
					id: usrMeta._id,
					creatorName: usrMeta.creatorName,
					creatorLink: usrMeta.creatorLink
				}

				serverStar.active = true;

				// Load data into ServerStar:
				// var newStar = new ServerStar(serverStar);

				// console.log(serverStar);

				if(serverStar.originStarID == -1) { /// is this the check we want??
					// Creating a new constellation.
					var newConstellationID = constellationCount + 1;
					constellationCount += 1;

					MLMeta.updateOne({ id: "persistors" }, { $inc: { constellationCount: 1 } });

					serverStar.constellationID = newConstellationID;
					serverStar.tier = 0;

					var newConstellation = {
						id: newConstellationID,
						starIDs: [newStarID]
					}

					constellations.insertOne(newConstellation, function(err, result) {
						////TODO refactoring; what if there's an err?
					});

					return stars.insertOne(serverStar)
						.then(result => {
							if(callback) callback(false, result.ops[0]);
							return result.ops[0];
						})
						.catch(err => {
							if(callback) callback(err);
							throw err; ///
						});
				} else {
					// Recreation of a star.

					// Get original star:
					return me.getStar(serverStar.originStarID)
						.then(originStar => {
							serverStar.originStarID = originStar.id;
							serverStar.constellationID = originStar.constellationID;
							serverStar.tier = originStar.tier + 1;

							return stars.insertOne(serverStar);
						})
						.then(result => {
							if(callback) callback(false, result.ops[0]); ///
							return result.ops[0];
						})
						.catch(err => {
							if(callback) callback(err);
							return false;
						});
				}

			})
			.catch(err => {
				throw err;
			});
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
