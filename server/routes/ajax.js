const express = require('express');

const config = require('../../config/telep.config.js');

const Telep = require('../components/TelepServer');
const Stars = require('../components/StarMapper');
const ServerStar = require('../components/ServerStar');
const api = require('../components/TelepAPI');

const routesIndex = require('./index');
const authRoutes = require('./auth');
const creationRouter = require('./create');
const adminRoutes = require('./admin');

///REVISIT weird architecture
//var api;
function generate(telepServer) {
	//@REVISIT architecture of this block:

	var ajaxRouter = express.Router();

	ajaxRouter.get('/user/:userPublicID', getSingleUser);

	ajaxRouter.post('/login',
		authRoutes.login,
		validateUser,
		authSuccessResponse);

	ajaxRouter.post('/register',
		authRoutes.register,
		authRoutes.login,
		validateUser,
		authSuccessResponse);

	ajaxRouter.post('/logout', authRoutes.logout);

	var userActionRouter = express.Router();
	userActionRouter.use(validateUser);

	userActionRouter.post('/sync', syncWithClient);
	userActionRouter.post('/update-profile', updateProfile);

	userActionRouter.post('/bookmark', bookmarkStar);
	userActionRouter.post('/remove-bookmark', removeBookmarkStar);

	userActionRouter.post('/create-comment', createComment);
	userActionRouter.post('/delete-comment/:commentPublicID', deleteComment);

	//@TODO change to a .get request I think?:
	userActionRouter.post('/get-star-comments', getStarComments);

	//ajaxRouter.post('/request-upload-url', createRoutes.requestUploadURL);
	userActionRouter.use(creationRouter);

	userActionRouter.use('/admin', adminRoutes.generate('json'));

	ajaxRouter.use(userActionRouter);

	ajaxRouter.use(ajaxStatusHandler);
	ajaxRouter.use(ajaxErrorHandler);

	return ajaxRouter;
}

//function validateUserLevel(level) {
//    return function(req, res, next) {
//        if(!req.user) {
//            res.json({ errors: ["not logged in"] });
//            return false; ///
//        }

//        if(!req.user.accessLevel) {
//            res.json({ errors: ["no creator credentials"] });
//            return false; ///
//        }

//        next();
//    }
//}

function validateUser(req, res, next) {
	if(!req.user) { ///TODO moving
		//res.json({ errors: ["not logged in"] });
		//return false;
		next("Not logged in.");
	} else {
		next();
	}
}

function authSuccessResponse(req, res) { //@REVISIT naming
	res.json({
		errors: [],
		///TODO probably generalize front-end props; maybe a ClientUser class
		user: req.user.export('client'),
	});
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
	console.log(req.body);

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
	api.updateProfile(
		req.user,
		// Convert to normal object with helper methods like hasOwnProperty:
		Object.assign({}, req.body)
	).then(result => {
		res.json({ errors: [] });
	});
}

function bookmarkStar(req, res, next) {
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
	return api.createComment(
		req.user,
		req.body['starID'],
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

/**
 * Router handler for deleting a comment.
 **/
function deleteComment(req, res, next) {
	return api.deleteComment(
		req.user,
		req.params.commentPublicID
	)
		.then(success => {
			res.json({
				errors: []
			});
		})
		.catch(err => {
			throw err;
		});

}


/** Router handler for retrieving star comments. **/
function getStarComments(req, res, next) {
	return api.getStarComments(
		req.body['starID'],
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

/** Router handler for retrieving single user. **/
function getSingleUser(req, res, next) {
	api.getUserByPublicID(req.params.userPublicID)
		.then(singleUser => {
			res.json({
				errors: [],
				user: singleUser.export('client')
			});
		});
}

function ajaxErrorHandler(err, req, res, next) {
	//console.trace();
	console.log(err.stack);
	console.log('ajax error: ' + err);
	res.json({ errors: err instanceof Error ? [err.message] : err }); ///TODO just always throw Error and get rid of this check
	return next();
}

module.exports = { generate };
