const Lame = require('node-lame').Lame;
const fs = require('fs');

module.exports = function(db) {
	var stars = db.collection('MLstars');

	var me = this;

	var musicPath = __dirname + "/../public/music/";

	me.grr = false;

	///:
	var MLMeta = db.collection('MLMeta'); /// do we need to filter MLMeta?
	var usrMeta = db.collection('usrMeta'); /// do we need to filter MLMeta?
	var MLPcurrentPlanetIndex;
	MLMeta.find({ id: 'persistors' }).limit(1).next(function(err, persistorDoc) {
		if(!persistorDoc) {
			// persistorDoc = {}; /// quick-fix
			MLMeta.insertOne({
				id: 'persistors',
				userIndex: 1,
				currentConstellationIndex: 1,
				currentPlanetIndex: 1
			}, function() {
				
			});
		} else {
			if(persistorDoc.hasOwnProperty("currentPlanetIndex")) {
				MLPcurrentPlanetIndex = persistorDoc.currentPlanetIndex;
			} else {
				MLMeta.updateOne({ id: "persistors" }, { $set: { currentPlanetIndex: 0 } });
			}
		}
	});

	me.getUsrMeta = function(userID, callback) {
		usrMeta.findOne({ userID }, function(err, doc) {
			if(err) {
				console.error(err);
				///
				callback(err);
				return false;
			}

			callback(err, doc);
		});
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
		stars.find({ active: true }).toArray(function(err, results) {
			if(err) {
				// console.log(err);
				////
				// cb(err);
				return false;
			}

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

	me.createStar = function(userID, starData, callback) {
		// var defaultObject = {
		// 	originStar: false,
		// 	fileURL: false,
		// 	multerFile: false,
		// };
		// Object.assign();

		var newStarID = MLPcurrentPlanetIndex;
		MLPcurrentPlanetIndex += 1;
		MLMeta.updateOne({ id: "persistors" }, { $inc: {currentPlanetIndex: 1} });

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

		me.getUsrMeta(userID, function(err, usrMeta) { /// not digging this architecture
			var newStar = {
				id: newStarID,
				originStarID: starData.originStarID,
				sourceX: false, ///
				sourceY: false, ///
				tier: 0,
				creator: {
					id: usrMeta._id,
					creatorName: usrMeta.creatorName,
					creatorLink: usrMeta.creatorLink
				},
				// creator: usrMeta.creatorName,
				// creatorLink: usrMeta.creatorLink,
				x: starData.x,
				y: starData.y,
				title: starData.title,
				// placed: false,
				// initialized: false,
				hostType: starData.hostType,
				fileURL: starData.fileURL,
				color: starData.color,
				active: true,
				// expiration: expirationMS,
				// rgb: 
			}

			if(starData.originStarID == -1) {
				stars.insertOne(newStar, function(err, result) {
					callback(err, result.ops[0]); ///
				});
			} else {
				me.getStar(starData.originStarID, function(err, originStar) {
					if(err) {
						callback(err);
						return false;
					}

					newStar.sourceX = originStar.x;
					newStar.sourceY = originStar.y;
					newStar.tier = originStar.tier + 1;

					stars.insertOne(newStar, function(err, result) {
						callback(err, result.ops[0]); ///
					});
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
