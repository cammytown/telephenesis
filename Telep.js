module.exports = function(db) {
	var planets = db.collection('MLplanets'); /// safe name?

	var me = this;

	me.grr = false;

	///:
	var MLMeta = db.collection('MLMeta'); /// do we need to filter MLMeta?
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

	me.createStar = function(uid, sourceStar, callback) {
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

		planets.insertOne({
			id: newPlanetId,
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

	me.place = function(starId, x, y, rgb, callback) {
		planets.update(
			{ id: starId },
			{ $set: { x, y, rgb, initialized: true, placed: true } },
			function(err, result) {
				callback(err, result);
			}
		);
	}
}
