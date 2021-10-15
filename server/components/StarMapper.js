////REVISIT not currently in use

const Lame = require('node-lame').Lame;
const fs = require('fs');
const Star = require('../../abstract/Star.js');

module.exports = function(db) {
	var me = this;

	var constellations = db.collection('MLconstellations');
	var stars = db.collection('MLstars');

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

	me.getStars = function(userID = false, cb) {
		// stars.find({ initialized: true }).toArray(function(err, results) {
		return stars.find({ active: true }).toArray(function(err, results) {
			if(err) {
				// console.log(err);
				////
				// cb(err);
				return false;
			}

			results.forEach(document => {
				var creationDate = new Date(document._id.getTimestamp());
				document.timestamp = creationDate.getTime(); // Convert Date to unix timestamp
			} );

			cb(results);
		});
	}

	me.getStar = function(starId, callback) {
		stars.findOne({ id: starId }, function(err, doc) {
			if(err) {
				// console.log(err);
				////
				callback(err);
				return false;
			}

			// var usrMeta = me.getUsrMeta(doc.userID); /// probably cache in the star and update whenever profile changes
			// doc.creatorName = usrMeta.creatorName;

			var creationDate = new Date(doc._id.getTimestamp());
			doc.timestamp = creationDate.getTime(); // Convert Date to unix timestamp

			callback(err, doc);
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

	me.createStar = function(userID, starData, callback) {
		// var defaultObject = {
		// 	originStar: false,
		// 	fileURL: false,
		// 	multerFile: false,
		// };
		// Object.assign();

		var newStarID = planetCount + 1;
		planetCount += 1;
		MLMeta.updateOne({ id: "persistors" }, { $inc: {planetCount: 1} });

		switch(starData.hostType) {
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
			starData.id = newStarID;

			starData.creator = { ///REVISIT architecture?
				id: usrMeta._id,
				creatorName: usrMeta.creatorName,
				creatorLink: usrMeta.creatorLink
			}

			starData.active = true;

			// Load data into ServerStar:
			var newStar = new Star();
			newStar.loadData(starData, 'client');

			if(starData.originStarID == -1) {
				// Creating a new constellation.
				var newConstellationID = constellationCount + 1;
				constellationCount += 1;

				MLMeta.updateOne({ id: "persistors" }, { $inc: { constellationCount: 1 } });

				newStar.constellationID = newConstellationID;

				var newConstellation = {
					id: newConstellationID,
					starIDs: [newStarID]
				}

				constellations.insertOne(newConstellation, function(err, result) {
					////TODO refactoring; what if there's an err?
				});

				stars.insertOne(newStar, function(err, result) {
					if(callback) callback(err, result.ops[0]); ///
				});
			} else {
				// Recreation of a star.

				// Get original star:
				me.getStar(starData.originStarID)
				.then(originStar => {
					newStar.originStarID = originStar.id;
					newStar.constellationID = originStar.constellationID;
					newStar.tier = originStar.tier + 1;

					return stars.insertOne(newStar)
				})
				.then(result => {
					if(callback) callback(false, result.ops[0]); ///
				})
				.catch(err => {
					if(callback) callback(err);
					return false;
				});
			}

			return true;
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
