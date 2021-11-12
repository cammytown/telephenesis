const Lame = require('node-lame').Lame;
const fs = require('fs');

const TelepUser = require('./TelepUser.js');
const ServerStar = require('./ServerStar.js');
const Stars = require('./StarMapper.js');

const CONSTS = require('../../abstract/constants.js');

/**
 * Base Telephenesis methods.
 * @constructor
 **/
function TelepAPI(server) {
	var me = this;

	/** Instance of Usr. **/
	var usr;

	/** Connection to the database. **/
	var db;

	/** The loaded Telephenesis config file. **/
	var config;

	/** MongoCollection of stars. **/
	var stars;

	/** MongoCollection of system meta-information. **/
	var MLMeta;

	/** MongoCollection of user profile information. **/
	var usrMeta;


	/** A path to where uploaded art will be stored on the server. **/
	var musicPath = __dirname + "/../public/music/"; ///MOVE to config

	this.initialize = function(server) {
		api = server.api;
		usr = server.usr;
		db = server.db;
		config = server.config;
		// me.grr = false;

		stars = db.collection('MLstars');
		MLMeta = db.collection('MLMeta'); /// do we need to filter MLMeta?
		usrMeta = db.collection('usrMeta'); /// do we need to filter MLMeta?

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

	me.renameStar = function(starId, creatorName, callback) {
		stars.updateOne(
			{ id: starId },
			{ $set: { creatorName } },
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

module.exports = new TelepAPI();
