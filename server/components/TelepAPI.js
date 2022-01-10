const TelepUser = require('./TelepUser.js');
const artists = require('./ArtistMapper');
const CONSTS = require('../../abstract/constants.js');

/**
 * Base Telephenesis methods.
 * @constructor
 **/
function TelepAPI() {
	var me = this;

	//@REVISIT architecture:
	var server = null;

	/** Instance of Usr. **/
	var usr;

	/** Connection to the database. **/
	var db;

	/** MongoCollection of stars. **/
	var dbStars;

	/** MongoCollection of system meta-information. **/
	var MLMeta;

	/** MongoCollection of user account information. **/
	var usrMeta;

	/** MongoCollection of star comments. **/
	var dbComments;

	/** A path to where uploaded art will be stored on the server. **/
	var musicPath = __dirname + "/../public/music/"; ///MOVE to config

	this.initialize = function(serverInput) {
		server = serverInput;

		usr = server.usr;
		db = server.db;
		// me.grr = false;

		dbStars = db.collection('MLstars');
		MLMeta = db.collection('MLMeta'); /// do we need to filter MLMeta?
		usrMeta = db.collection('usrMeta'); /// do we need to filter MLMeta?
		dbComments = db.collection('starComments');
	}

	/**
	 * Observe pertinent information sent from the client; like star plays.
	 * @param {array} serverUpdates
	 **/
	me.syncWithClient = function(serverUpdates) {
		return Promise.all([
			dbStars.updateMany(
				{ publicID: { $in: serverUpdates.partialPlay } },
				{ $inc: { partialPlays: 1 } }
			),

			dbStars.updateMany(
				{ publicID: { $in: serverUpdates.longPlay } },
				{ $inc: { longPlays: 1 } }
			)
		])
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

	/**
	 * Retrieve a user by their public ID.
	 * @param userPublicID
	 * @param [fullProfile=true]
	 **/
	//@REVISIT fullProfile not currently in use
	this.getUserByPublicID = function(userPublicID, fullProfile = true) {
		//@TODO clean up architecture so we can probably say me.getUserMeta():
		return usrMeta.findOne({ publicID: userPublicID })
			.then(userMeta => {
				return me.getUserComments(userPublicID).then(userComments => {
					userMeta.comments = userComments;
					console.log(userMeta.comments);
					return new TelepUser(null, userMeta);
				});
			});
	}

	//@TODO revisit naming and get rid of callback param
	this.getUserMeta = function(userID, callback) {
		return usrMeta.findOne({ userID })
			//.then(userMeta => {
			//    if(callback) callback(false, userMeta);

			//    //@TODO cache user artists in userMeta
			//    return artists.getUserArtists(userMeta.publicID)
			//        .then(artists => {
			//            userMeta.artists = artists;
			//            return userMeta;
			//        });
			//})
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
				server.generatePublicID(usrMeta)
					.then(publicID => {
						//@REVISIT maybe have like a static TelepUser.buildInitialObject
						var userMetaObject = {
							publicID,
							accessLevel: 0,
							displayName,
							//creatorName,
							creationTickets: 1,
							recreationTickets: 3,
							bookmarks: [],
							artists: [],
						};

						var newUser = new TelepUser(usrDoc, userMetaObject);

						return usrMeta.insertOne(newUser.export('usrMeta'))
							.then(result => {
								return newUser;
							})
							.catch(err => {
								throw err;
							});
					}); // server.generatePublicID()
			})
			.catch(err => {
				// o.render('register', { p: req.body, errors: err });
				throw err;
			});
	}

	// me.createAccount = function(accountData, callback) { /// post naming?
	// 	usrMeta.insertOne(accountData, function(err, result) {
	// 		if(err) {
	// 			////
	// 			callback(err);
	// 		}

	// 		callback(err, result);
	// 	});
	// }

	/**
	 * Update user account information.
	 * @param {TelepUser} user - The user to update.
	 * @param {object} newValues - The new properties/values to set.
	 **/
	this.updateAccount = function(user, newValues) {
		if(newValues.email) {
			///@TODO allow email changes
			// Not allowing email changes for now:
			delete newValues.email;
		}

		user.loadData(newValues);

		// Update references to the user document:
		//dbStars.updateMany(
		//    { creatorId: userPublicID },
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

	/**
	 * Create a new comment for a star by a user.
	 * @param {TelepUser} telepUser - The user creating the comment.
	 * @param {number} starID - ID of star.
	 * @param {string} commentText - Text content of comment.
	 * @returns {Promise<object>} The database _id of the new comment.
	 **/
	this.createComment = function(telepUser, starID, commentText, replyingTo) {
		return server.generatePublicID(dbComments).then(publicID => {
			var newComment = {
				publicID,
				user: telepUser.export('commentCache'),
				starID,
				text: commentText,
				replyingTo, //@REVISIT naming
			};

			//CommentPotion.createComment(

			return dbComments.insertOne(newComment)
				.then(result => {
					////TODO do we care about result.acknowledged or can we assume
					//that if something goes wrong it will be sent to the .catch
					//block?:
					//return result.insertedID;
					return newComment;
				});
		});
	}

	/**
	 * Delete a comment.
	 * @param {TelepUser} telepUser - The user deleting the comment.
	 * @param {string} commentPublicID - ID of comment.
	 * @returns {Promise<object>}
	 **/
	this.deleteComment = function(telepUser, commentPublicID) {
		return dbComments.findOne({ publicID: commentPublicID })
			.then(comment => {
				if(!comment) {
					throw new Error("Comment does not exist.");
				}

				if(comment.user.publicID != telepUser.publicID) {
					//@TODO log suspicious activity
					throw new Error("Not permitted to delete that comment.");
				}

				return dbComments.deleteOne({ publicID: commentPublicID });
			});
	}

	/**
	 * Retrieve comments made by user.
	 * @param {string} userPublicID
	 **/
	this.getUserComments = function(userPublicID) {
		return dbComments.find({ "user.publicID": userPublicID }).toArray();
	}

	/**
	 * Get comments for a star.
	 * @param {string} starID - ID of star to retrieve comments for.
	 **/
	this.getStarComments = function(starID) {
		return dbComments.find({ starID })
			.toArray() ///REVISIT speed?
			.then(docArray => {
				//var commentsObject = {};

				docArray.forEach(doc => {
					// Retrieve timestamp from MongoDB's _id field:
					doc.timestamp = new Date(doc._id.getTimestamp()).getTime();

					//// If comment is a reply to another comment:
					//if(doc.replyingTo) {
					//    // Add comment as child of comment it replies to:
					//    doc.replyingTo
					//}

					//commentsObject.push(doc);
				});

				return docArray;

				//@TODO filter values; prob by having a class with export()
				//return commentsObject;
			});
	}
}

module.exports = new TelepAPI();
