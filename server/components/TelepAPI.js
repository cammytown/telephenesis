const Lame = require('node-lame').Lame;
const fs = require('fs');

const TelepUser = require('./TelepUser.js');
const ServerStar = require('./ServerStar.js');
const Stars = require('./StarMapper.js');

const CONSTS = require('../../abstract/constants.js');
//const config = require('../../abstract/telep.config.js');

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

	/** MongoCollection of stars. **/
	var stars;

	/** MongoCollection of system meta-information. **/
	var MLMeta;

	/** MongoCollection of user profile information. **/
	var usrMeta;

	/** MongoCollection of star comments. **/
	var dbComments;

	/** A path to where uploaded art will be stored on the server. **/
	var musicPath = __dirname + "/../public/music/"; ///MOVE to config

	this.initialize = function(server) {
		api = server.api;
		usr = server.usr;
		db = server.db;
		// me.grr = false;

		stars = db.collection('MLstars');
		MLMeta = db.collection('MLMeta'); /// do we need to filter MLMeta?
		usrMeta = db.collection('usrMeta'); /// do we need to filter MLMeta?
		dbComments = db.collection('starComments');
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

	/**
	 * Retrieve a user by their session code.
	 * @param {string} sessionCode
	 * @returns {TelepUser | false}
	 **/
	this.getUserBySessionCode = function(sessionCode) {
		return usr.in(sessionCode)
			.then(user => {
				// If successfully logged in using session code:
				if(user) {
					// Get user meta information:
					return me.getUserMeta(user.id)
						.then(usrMeta => {
							// Create a secure object by loading into
							// TelepUser:
							return new TelepUser(user, usrMeta);
						})
						.catch(err => {
							if(err) {
								throw err;
							}
						});
				} else {
					return false;
				}
			});
	}

	this.getUserMeta = function(userID, callback) {
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

	me.login = function(email, password, ip) {
		return usr.li(email, password, ip)
			.then(usrDoc => {
				return me.getUserMeta(usrDoc.id)
					.then(userMeta => {
						return new TelepUser(usrDoc, userMeta);
					});
			})
			.catch(err => {
				throw err;
			});
	}

	me.register = function(email, password, displayName, creatorName, ip) {
		return usr.rg(email, password, ip)
			.then(usrDoc => {
				var userMetaObject = {
					displayName,
					creatorName,
					creationTickets: 1,
					recreationTickets: 3,
					bookmarks: [],
				};

				console.log(userMetaObject);
				var newUser = new TelepUser(usrDoc, userMetaObject);

				return usrMeta.insertOne(newUser.export('usrMeta'))
					.then(result => {
						return newUser;
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

	/**
	 * Update user profile information.
	 * @param {TelepUser} user - The user to update.
	 * @param {object} newValues - The new properties/values to set.
	 **/
	this.updateProfile = function(user, newValues) {
		if(newValues.email) {
			///@TODO allow email changes
			// Not allowing email changes for now:
			delete newValues.email;
		}

		user.loadData(newValues);

		// Update references to the user document:
		//stars.updateMany(
		//    { creatorId: userID },
		//    { $set: { "creator.creatorName": post.creatorName }}
		//);

		// Update the usrMeta object:
		return usrMeta.updateOne(
			{ userID: user.id },
			{
				// "email": post.email, //// send confirmation if different
				//$set: { "creatorName": post.creatorName }

				//@REVISIT only need to set properties thave have changed but
				//we're setting all of them; do we care?:
				$set: user.export()
			}
		);
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

	/**
	 * Create a new comment for a star by a user.
	 * @param {TelepUser} telepUser - The user creating the comment.
	 * @param {number} starID - ID of star.
	 * @param {string} commentText - Text content of comment.
	 * @returns {Promise<number>} The database _id of the new comment.
	 **/
	this.createComment = function(telepUser, starID, commentText) {
		var newComment = {
			user: telepUser.export('commentCache'),
			starID,
			text: commentText,
		};

		return dbComments.insertOne(newComment)
			.then(result => {
				////TODO do we care about result.acknowledged or can we assume
				//that if something goes wrong it will be sent to the .catch
				//block?:
				return result.insertedID;
			});
	}

	/**
	 * Get comments for a star.
	 * @param {number} userID - ID of user retrieving comments.
	 * @param {number} starID - ID of star to retrieve comments for.
	 **/
	this.getComments = function(userID, starID) {
		///TODO do something with userID or remove it from params

		return dbComments.find({ starID })
			.toArray() ///REVISIT speed?
			.then(docArray => {
				docArray.forEach(doc => {
					doc.timestamp = new Date(doc._id.getTimestamp()).getTime();
				});

				return docArray;
			});
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
