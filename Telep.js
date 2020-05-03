const Lame = require('node-lame').Lame;
const fs = require('fs');

module.exports = function(db) {
	var planets = db.collection('MLplanets'); /// safe name?

	var me = this;

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
				userIndex: 0,
				currentConstellationIndex: 0,
				currentPlanetIndex: 0
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

	me.getUsrMeta = function(uid, callback) {
		usrMeta.findOne({ uid }, function(err, doc) {
			if(err) {
				console.error(err);
				///
				return false;
			}

			callback(doc);
		});
	}

	me.getPlanets = function(userId = false, cb) {
		planets.find({ initialized: true }).toArray(function(err, results) {
			if(err) {
				// console.log(err);
				////
				return false;
			}

			cb(results);
		});
	}

	me.getStar = function(starId, callback) {
		planets.findOne({ id: starId }, function(err, doc) {
			if(err) {
				// console.log(err);
				////
				return false;
			}

			callback(err, doc);
		});
	}

	me.createStar = function(uid, sourceStar, multerFile, callback) {
		var sourceId = false;
		var sourceX = false;
		var sourceY = false;
		var tier = 0;

		if(sourceStar) {
			sourceId = sourceStar.id;
			sourceX = sourceStar.x;
			sourceY = sourceStar.y;
			tier = sourceStar.tier + 1;
		}

		var newPlanetId = MLPcurrentPlanetIndex;
		MLPcurrentPlanetIndex += 1;
		MLMeta.updateOne({ id: "persistors" }, { $inc: {currentPlanetIndex: 1} });

		var starFileName = newPlanetId;
		switch(multerFile.mimetype) {
			case 'audio/aiff':
			case 'audio/wav':
			{
				starFileName += '.mp3';

				const encoder = new Lame({
					"output": "./public/music/" + starFileName,
					"bitrate": 256
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
				var target_path = 'public/music/' + starFileName;
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
				var target_path = 'public/music/' + starFileName;
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

		planets.insertOne({
			id: newPlanetId,
			// uid,
			sourceId,
			sourceX, ///
			sourceY, ///
			// constellationId: targetConstellationId,
			tier,
			creatorId: uid,
			creatorName: "testt",
			x: 0,
			y: 0,
			placed: false,
			initialized: false,
			// expiration: expirationMS,
			// rgb: 
		}, function(err, result) {
			callback(result.ops[0]); ///
		});
	}

	me.bookmark = function(star, uid, callback) {
		// usrMeta.update(
		usrMeta.update(
			{ uid },
			{ $addToSet: { bookmarks: star.id } },
			{ upsert: true },
			callback
		);
	}

	me.recolor = function(starId, rgb, callback) {
		planets.update(
			{ id: starId },
			{ $set: { rgb } },
			callback
		);
	}

	me.move = function(starId, x, y, callback) {
		planets.update(
			{ id: starId },
			{ $set: { x, y } },
			callback
		);
	}

	me.renameStar = function(starId, creatorName, callback) {
		planets.update(
			{ id: starId },
			{ $set: { creatorName } },
			callback
		);
	}

	me.place = function(starId, x, y, rgb, callback) {
		planets.update(
			{ id: starId },
			{ $set: { x, y, rgb, initialized: true, placed: true } },
			callback
		);
	}
}
