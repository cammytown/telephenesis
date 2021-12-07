const express = require('express');
//const api = require('../components/TelepAPI');
const ServerStar = require('../components/ServerStar');
//const uploads = require('../components/UploadMapper');
const stars = require('../components/StarMapper');
const config = require('../../config/telep.config');

function generate() {
	var createRouter = express.Router();
	createRouter.use(validateCreator);
	createRouter.post('/initialize-star', initializeStar);
	createRouter.post('/actualize-star', actualizeStar);
	return createRouter;
}

function validateCreator(req, res, next) {
	if(!req.user || req.user.accessLevel < config.creatorLevel) {
		///REVISIT:
		next("Not logged in or not permitted");
	} else {
		next();
	}
}

//function requestUploadURL(req, res, next) {
function initializeStar(req, res, next) {
	//var serverStar = new ServerStar(req.body, 'client');
	stars.initializeStar(req.user, req.body)
		.then(newServerStar => {
			res.json({
				errors: [],
				newStar: newServerStar.export(['uploadURL', 'file'])
			});
		})
		.catch(err => {
			next(err);
		});
}

/**
 * Ensures the properties of the star are valid.
 * @param {object} user - The user who is proposed to own the star.
 * @param {ServerStar} serverStar - The star to check.
 * @returns boolean;
 **/
function validateStar(user, serverStar) {
	//@REVISIT error handling
	//@TODO-3 double-check this for anything that was missed; validate other fields?

	if(serverStar.publicID) {
		if(serverStar.artist) {
			if(!serverStar.artist.publicID) {
				console.error("No serverStar.artist.publicID");
				return false;
			}
		}

		var validArtist = false;
		for(var userArtist of user.artists) {
			if(userArtist.publicID == serverStar.artist.publicID) {
				validArtist = true;
			}
		}
	}

	return true;
}

function actualizeStar(req, res, next) {
	// Build Star:
	var newStar = new ServerStar(req.body, 'client');

	// Validate user-supplied properties of star:
	if(!validateStar(req.user, newStar)) {
		//@TODO suspicious activity; log somewhere
		next("You are not authorized to actualize that star.");
		return false;
	}

	switch(req.body.hostType) {
		 case 'upload': {
			 // Star should already have been initialized.
		 } break;

		case 'external': {
		} break;

		default: {
			console.error('unhandled hostType: ' + req.body.hostType);
		}
	}

	// Create the star in the database:
	stars.actualizeStar(req.user, newStar)
		.then(result => {
			res.json({
				errors: [],
				actualizedStar: result.newStar,
				creatorName: req.user.creatorName,
				//newStarPublicID: result.newStar.publicID,
				//timestamp: result.newStar.timestamp,
				starMovements: result.starMovements,
			});

		})
		.catch(err => {
			//console.error(err); ///
			//res.json({ errors: "Could not create star." }); ///TODO improve error
			//throw new Error(err);
			next(err);
		});

	// 			// $content = "Hello, ".$lmeta['name'].".\n\n";
	// 			// $content .= "Someone has recreated your star on Telephenesis! Check it out here:\n\n";
	// 			// $content .= URL.'/'.$sid."\n\n";
	// 			// $content .= "Exciting!\n\n";
	// 			// $content .= "Don't want these messages? Just reply to this email letting us know."; ///
	// 			// api.email($luser['em'], 'Someone recreated your star', $content);

}

module.exports = generate(); //@REVISIT
//module.exports = {
//    //generate,
//    initializeStar,
//    actualizeStar,
//};
