const express = require('express');
const Telep = require('../TelepServer.js');
const routesIndex = require('./index');

var api = Telep.api;

// var ajaxRouter = require('./ajax')
var ajaxRouter = express.Router();

ajaxRouter.post('/sync', syncWithClient);
ajaxRouter.post('/bookmark', bookmarkStar);
ajaxRouter.post('/removeBookmark', removeBookmarkStar);
ajaxRouter.post('/actualize', actualizeStar);

ajaxRouter.post('/login', authRoutes.login, userCheck);
ajaxRouter.post('/register', authRoutes.register, authRoutes.login, userCheck);
ajaxRouter.post('/logout', authRoutes.logout);

ajaxRouter.post('/upload/:starid', api.auth('creator'), routesIndex.upload.single('submission'), uploadMedia);
ajaxRouter.use(ajaxErrorHandler);


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
			res.json({ error: false }); ///REVISIT do we really care to wait for server updates?
		})
		.catch(err => {
			throw new Error(err); ///
		});
}

function bookmarkStar(req, res) {
	// if(!req.user || (req.user.id != star.creatorId && req.user.lv != 
	if(!req.user) {
		res.json({ error: "not logged in" });
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
			res.json({ error: "Couldn't bookmark." }); ///
			return false;
		});
}

function removeBookmarkStar(req, res) {
	if(!req.user) { ///REFACTOR
		res.json({ error: "not logged in" });
		return false;
	}

	return api.removeBookmark(req.body.starID, req.user.id)
		.then(result => {
			res.json({ errors: false });
		})
		.catch(err => {
			console.error(err);
			res.json({ error: "Couldn't remove bookmark." }); ///
			return false;
		});
}

function userCheck(req, res) {
	if(!req.user) {
		throw ["Not logged in."];
	}

	res.json({ errors: [] });
	return true;
}


function ajaxErrorHandler(err, req, res, next) {
	console.log(err.stack);
	console.log('ajax error: ' + err);
	res.json({ errors: err instanceof Error ? [err.message] : err }); ///TODO just always throw Error and get rid of this check
}

module.exports = { ajaxRouter };
