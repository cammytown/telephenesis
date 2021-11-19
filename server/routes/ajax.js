const express = require('express');

const config = require('../../abstract/telep.config.js');

const Telep = require('../components/TelepServer');
const Stars = require('../components/StarMapper');
const ServerStar = require('../components/ServerStar');
const api = require('../components/TelepAPI');

const routesIndex = require('./index');
const authRoutes = require('./auth');
const adminRoutes = require('./admin');

///REVISIT weird architecture
//var api;
function generate(telepServer) {
	//api = telepServer.api;

	var ajaxRouter = express.Router();

	ajaxRouter.post('/sync', syncWithClient);
	ajaxRouter.post('/update-profile', updateProfile);

	ajaxRouter.post('/bookmark', bookmarkStar);
	ajaxRouter.post('/remove-bookmark', removeBookmarkStar);
	ajaxRouter.post('/create-comment', createComment);
	ajaxRouter.post('/get-comments', getComments);

	ajaxRouter.post('/actualize', actualizeStar);

	ajaxRouter.post('/login', authRoutes.login, userCheck);
	ajaxRouter.post('/register', authRoutes.register, authRoutes.login, userCheck);
	ajaxRouter.post('/logout', authRoutes.logout);

	ajaxRouter.use('/admin', adminRoutes.generate('json'));

	//ajaxRouter.post('/upload/:starid', api.auth('creator'), routesIndex.upload.single('submission'), uploadMedia);
	ajaxRouter.use(ajaxStatusHandler);
	ajaxRouter.use(ajaxErrorHandler);

	return ajaxRouter;
}

function ajaxStatusHandler(req, res, next) {
	res.status(404).json({
		errors: ["Invalid endpoint."], ///REVISIT maybe don't allow people to determine endpoints through trial/error
	});
}

/**
 * This method runs somewhat regularly and handles basic exchange
 * of information between client and server. The server informs the
 * client of new stars, and the client informs the server of
 * media plays, etc.
 */
function syncWithClient(req, res) {
	console.log("syncWithClient");

	////TODO security to prevent spoofed plays

	var serverUpdates = {
		partialPlay: [],
		longPlay: []
	};

	for (var updateIndex = 0; updateIndex < req.body.serverUpdates.length; updateIndex++) {
		var update = req.body.serverUpdates[updateIndex];

		////TODO validate inputs

		switch(update.type) {
			case 'partialPlay':
			case 'longPlay': {
				serverUpdates[update.type].push(update.starID);
			} break;

			default: {
			}
		}
	}

	return api.syncWithClient(serverUpdates)
		.then(values => {
			res.json({ errors: false }); ///REVISIT do we really care to wait for server updates?
		})
		.catch(err => {
			throw new Error(err); ///
		});
}

function updateProfile(req, res, next) {
	if(!req.user) { ///TODO moving
		res.json({ errors: ["not logged in"] });
		return false;
	}

	api.updateProfile(
		req.user,
		// Convert to normal object with helper methods like hasOwnProperty:
		Object.assign({}, req.body)
	).then(result => {
		res.json({ errors: [] });
	});
}

function bookmarkStar(req, res, next) {
	// if(!req.user || (req.user.id != star.creatorId && req.user.lv !=
	if(!req.user) {
		res.json({ errors: ["not logged in"] });
		return false;
	}

	//var starID = parseInt(req.body.starID); /// do we need to parseInt now that we pass json??

	return api.bookmark(req.body.starID, req.user.id)
		.then(result => {
			res.json({ errors: false });
		})
		.catch(err => {
			///
			console.error(err);
			res.json({ errors: ["Couldn't bookmark."] }); ///
			return false;
		});
}

function removeBookmarkStar(req, res) {
	if(!req.user) { ///REFACTOR
		res.json({ errors: ["not logged in"] });
		return false;
	}

	return api.removeBookmark(req.body.starID, req.user.id)
		.then(result => {
			res.json({ errors: false });
		})
		.catch(err => {
			console.error(err);
			res.json({ errors: ["Couldn't remove bookmark."] }); ///
			return false;
		});
}

/**
 * Router handler for posting a new comment.
 **/
function createComment(req, res, next) {
	if(!req.user) { ///TODO move somewhere general
		///REVISIT:
		res.json({ errors: ["Not logged in or not permitted."] });
		throw new Error("Not logged in or not permitted.");
	}

	return api.createComment(
		req.user,
		parseInt(req.body['starID']),
		req.body['commentText'],
		req.body['replyingTo']
	)
		.then(newComment => {
			res.json({
				errors: [],
				newComment: {
					//@REVISIT-2 probably create Comment class with export() method:
					publicID: newComment.publicID,
					starID: newComment.starID,
					text: newComment.text,
					timestamp: new Date(), //@REVISIT sort of hacky
					user: newComment.user,
					replyingTo: newComment.replyingTo,
				},
			});
			//return commentID;
			//next();
		})
		.catch(err => {
			throw err;
		});

}

/** Router handler for retrieving star comments. **/
function getComments(req, res, next) {
	return api.getComments(
		req.user.id,
		parseInt(req.body['starID']),
	)
		.then(comments => {
			res.json({
				errors: [],
				comments,
			});
		})
		.catch(err => {
			next(err);
		});
}

function actualizeStar(req, res, next) { ///REVISIT move to a creation-specific set of routes?
	if(!req.user || req.user.lv < config.creatorLevel) { ///TODO move somewhere general
		///REVISIT:
		res.json({ errors: ["Not logged in or not permitted."] });
		throw new Error("Not logged in or not permitted.");
	}

	switch(req.body.hostType) {
		case 'external': {
			var newStar = new ServerStar(req.body);

			// Create the star in the database:
			return Stars.createStar(req.user, newStar)
				.then(result => {
					res.json({
						errors: false,
						creatorName: req.user.creatorName,
						newStarID: result.newStar.id,
						timestamp: result.newStar.timestamp,
						starMovements: result.starMovements,
					});

					return true;
				})
				.catch(err => {
					//console.error(err); ///
					//res.json({ errors: "Could not create star." }); ///TODO improve error
					//throw new Error(err);
					next(err);
				});

			// api.actualize(starData, function(err, result) {
			// 	if(err) {
			// 		res.json({ errors: "did not place" });
			// 		return false;
			// 	}

			// 	if(star.lsid) {
			// 		// $lstar = api.sid($star['lsid']);
			// 		// $luser = $usr->gt($lstar['uid']);
			// 		// $lmeta = api.meta($lstar['uid']);

			// 		// $content = "Hello, ".$lmeta['name'].".\n\n";
			// 		// $content .= "Someone has recreated your star on Telephenesis! Check it out here:\n\n";
			// 		// $content .= URL.'/'.$sid."\n\n";
			// 		// $content .= "Exciting!\n\n";
			// 		// $content .= "Don't want these messages? Just reply to this email letting us know."; ///

			// 		// api.email($luser['em'], 'Someone recreated your star', $content);
			// 	}

			// 	// res.json({ creator: umeta.name });
			// 	res.json({ errors: false });
			// });
		} break;

		// case 'upload': {
		// 	// Star should already have been created ///REVISIT architecture; maybe it would be better to just have some token associated to the upload that we use when creating the star
		// 	res.json({ errors: false });
		// } break;

		default: {
			console.error('unhandled hostType: ' + req.body.hostType);
		}
	}

	// api.getStar(sid, function(err, star) {
	// 	if(err) {
	// 		///
	// 		o.json({ errors: "could not get source star" });
	// 		return false;
	// 	}

	// 	if(!i.user || i.user.id != star.creator.uid) {
	// 		o.json({ errors: "not logged in" });
	// 		return false;
	// 	}

	// 	var x = parseInt(i.body.x);
	// 	var y = -1 * parseInt(i.body.y);
	// 	var rgb = i.body.rgb;

	// 	api.actualize(sid, x, y, rgb, function(err, result) {
	// 		if(err) {
	// 			o.json({ errors: "did not place" });
	// 			return false;
	// 		}

	// 		if(star.lsid) {
	// 			// $lstar = api.sid($star['lsid']);
	// 			// $luser = $usr->gt($lstar['uid']);
	// 			// $lmeta = api.meta($lstar['uid']);

	// 			// $content = "Hello, ".$lmeta['name'].".\n\n";
	// 			// $content .= "Someone has recreated your star on Telephenesis! Check it out here:\n\n";
	// 			// $content .= URL.'/'.$sid."\n\n";
	// 			// $content .= "Exciting!\n\n";
	// 			// $content .= "Don't want these messages? Just reply to this email letting us know."; ///

	// 			// api.email($luser['em'], 'Someone recreated your star', $content);
	// 		}

	// 		// o.json({ creator: umeta.name });
	// 		o.json({ errors: false });
	// 	});
	// });

}

function userCheck(req, res) {
	if(!req.user) {
		throw ["Not logged in."];
	}

	res.json({
		errors: [],
		///TODO probably generalize front-end props; maybe a ClientUser class
		user: req.user.export('client'),
	});

	return true;
}

function ajaxErrorHandler(err, req, res, next) {
	console.log(err.stack);
	console.log('ajax error: ' + err);
	res.json({ errors: err instanceof Error ? [err.message] : err }); ///TODO just always throw Error and get rid of this check
	return next();
}

module.exports = { generate };
