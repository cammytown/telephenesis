const express = require('express');
//const api = require('../components/TelepAPI');
const ServerStar = require('../components/ServerStar');
//const uploads = require('../components/UploadMapper');
const stars = require('../components/StarMapper');
const config = require('../../config/telep.config');

var usr;
function generate(telepServer) {
	usr = telepServer.usr;

	var createRouter = express.Router();
	return createRouter;
}

//function requestUploadURL(req, res, next) {
function initializeStar(req, res, next) {
	if(!req.user || req.user.lv < config.creatorLevel) { ///TODO move somewhere general
		///REVISIT:
		res.json({ errors: ["Not logged in or not permitted."] });
		throw new Error("Not logged in or not permitted.");
	}

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

function actualizeStar(req, res, next) {
	if(!req.user || req.user.lv < config.creatorLevel) { ///TODO move somewhere general
		///REVISIT:
		res.json({ errors: ["Not logged in or not permitted."] });
		throw new Error("Not logged in or not permitted.");
	}


	//@TODO-4 req.body needs to be filtered here or in ServerStar:
	//for instance, what if someone puts in their own publicID?
	var newStar = new ServerStar(req.body, 'client');

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

module.exports = {
	//generate,
	initializeStar,
	actualizeStar,
};
