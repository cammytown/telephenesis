const express = require('express');
const multer = require('multer');
const upload = multer({ dest: __dirname + '/../uploads/' });

const ServerStar = require('./components/ServerStar.js');
// const stars = require('./components/StarMapper.js');

// var telepServer = require('./components/TelepServer.js');
// const api = telepServer.api;

module.exports = {
	initializeRoutes
};

///REVISIT architecture:
var app;
var api;
var usr;

function initializeRoutes(telepServer) {
	///REVISIT architecture:
	app = telepServer.app;
	api = telepServer.api;
	usr = telepServer.usr;

	// Accept multipart form data (FormData):
	app.use(upload.array()); ///REVISIT move into TelepServer somehow?

	// var ajaxRouter = require('./ajax')
	var ajaxRouter = express.Router();
	ajaxRouter.post('/sync', syncWithClient);
	ajaxRouter.post('/bookmark', bookmarkStar);
	ajaxRouter.post('/actualize', actualizeStar);

	ajaxRouter.post('/login', login, userCheck);
	ajaxRouter.post('/register', register, login, userCheck);
	ajaxRouter.post('/logout', logout);

	ajaxRouter.post('/upload/:starid', api.auth('creator'), upload.single('submission'), uploadMedia);

	ajaxRouter.use(ajaxErrorHandler);

	app.use('/ajax', ajaxRouter);

	// app.post('/register', register);
	// app.post('/login', login);

	app.get('/:page?', main);
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
			res.json({ error: false }); ///REVISIT do we really care to wait for server updates?
		})
		.catch(err => {
			throw new Error(err); ///
		});
}

function bookmarkStar(req, res) {
	var sid = parseInt(req.body.sid);
	api.getStar(sid, function(err, star) {
		if(err) {
			///
			console.error(err);
			return false;
		}

		// if(!req.user || (req.user.id != star.creatorId && req.user.lv != 7)) {
		if(!req.user) {
			res.json({ error: "not logged in" });
			return false;
		}

		api.bookmark(star, req.user.id, function(err, result) {
			if(err) {
				///
				console.error(err);
				res.json({ error: "couldn't bookmark..." }); ///
				return false;
			}

			res.json({ error: 0 });
		});
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
	// console.trace();
	res.json({ errors: err });
}

function login(req, res, next) {
	return usr.li(req.body.email, req.body.password, req.ip)
		.then(userDoc => {
			res.cookie('usr_ss', userDoc.ss, {
				// secure: true /// https only
			});

			return usr.in(userDoc.ss);
		})
		.then(user => {
			if(user) {
				req.user = user;
			} else {
				
			}
		})
		.then(next)
		.catch(errors => {
			// res.render('login', { p: req.body, errors: err });
			console.error(errors);
			next(errors);
			// throw err;
		});
}

function register(req, res, next) {
	if(req.body['password'] != req.body['password-confirm']) {
		next(["Passwords don't match."]); ///ARCHITECTURE
		return false;
	}

	return api.register(
		req.body.email,
		req.body.password,
		req.body.creatorName,
		req.ip
	)
		.then(() => next())
		.catch(err => next(err));
		// .catch(err => {
		// 	// res.json({ error: err });
		// 	res.json({ error: err });
		// });
}

function logout(req, res, next) {
	res.clearCookie('usr_ss', {});

	res.json({ error: 0 });
}

function actualizeStar(req, res) {
	if(!req.user || req.user.lv != 7) {
		res.json({ error: "not logged in" });
		throw "not logged in"; ///
	}

	switch(req.body.hostType) {
		case 'external': {
			var newStar = new ServerStar(req.body);

			// Create the star in the database:
			return api.createStar(req.user.id, newStar)
				.then(result => {
					res.json({
						error: 0,
						creatorName: req.user.usrMeta.creatorName,
						newStarID: newStar.id,
						starMovements: result.starMovements,
					});
				})
				.catch(err => {
					console.error(err); ///
					res.json({ error: "could not create star" });
					throw new Error(err);
				});

			// api.actualize(starData, function(err, result) {
			// 	if(err) {
			// 		res.json({ error: "did not place" });
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
			// 	res.json({ error: 0 });
			// });
		} break;

		// case 'upload': {
		// 	// Star should already have been created ///REVISIT architecture; maybe it would be better to just have some token associated to the upload that we use when creating the star
		// 	res.json({ error: 0 });
		// } break;

		default: {
			console.error('unhandled hostType: ' + req.body.hostType);
		}
	}

	// api.getStar(sid, function(err, star) {
	// 	if(err) {
	// 		///
	// 		o.json({ error: "could not get source star" });
	// 		return false;
	// 	}

	// 	if(!i.user || i.user.id != star.creator.uid) {
	// 		o.json({ error: "not logged in" });
	// 		return false;
	// 	}

	// 	var x = parseInt(i.body.x);
	// 	var y = -1 * parseInt(i.body.y);
	// 	var rgb = i.body.rgb;

	// 	api.actualize(sid, x, y, rgb, function(err, result) {
	// 		if(err) {
	// 			o.json({ error: "did not place" });
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
	// 		o.json({ error: 0 });
	// 	});
	// });

}


function uploadMedia(req, res) { /// could maybe just use .post('/create/:starid')
// app.post('/ajax/upload/:starid', api.auth('creator'), upload.single('submission'), function(i, o) { /// could maybe just use .post('/create/:starid')
	/// consider putting objects in memory if we care about deep optimization later https://github.com/expressjs/multer#memorystorage

	return false; ///REVISIT uploading not currently allowed

	var starId = parseInt(req.params.starid);

	///:
	if(starId != -1) { ///
		api.getStar(starId, function(err, originStar) {
			api.createStar(req.user.id, {
				originStar,
				multerFile: req.file,
				callback: function(star) {
					res.json({ error: 0, sid: star.id });
				}
			});
		});
	} else {
		api.createStar(req.user.id, {
			multerFile: req.file,
			callback: function(star) {
				res.json({ error: 0, sid: star.id });
			}
		});
	}

	// src.on('error', function(err) {
	// 	o.json({ error: 1 });
	// });

	// if(!$ajax->upload(i.user.id, i.params.starid, i.file))
	// o.json({ error: "did not upload" });
	// break;
}

function main(req, res) {
	var realPages = ['help', 'login', 'register', 'settings', 'create'];

	var className = "";
	if(req.user) {
		className += " in";

		if(req.user.lv > 0) {
			className += " creator";
		} else if(req.user.lv == 7) {
			className += " adminor";
		}
	}

	if(
		req.params.page !== undefined ///REVISIT best check?
		&& realPages.indexOf(req.params.page) == -1
		&& isNaN(parseInt(req.params.page))
	) { /// isNaN necessary?
		res.status(404).send("Sorry, no page exists there."); ///
	} else {
		return api.getStars(req.user)
			.then(stars => { /// consolidate
				res.render('main', {
					pageTitle: 'telephenesis : ' + (req.params.page ? req.params.page : 'a game of musical echoes'), /// not if it is a number
					className,
					stars,
					// popularitySort: JSON.stringify(),
					user: req.user
				});
			})
			.catch(err => {
				res.status(404).send("Our website appears to be down. Sorry about that.");
			});
	}
}


function ajaxOp(i, o) {
	switch(i.params.operation) {
		case 'renameStar': {
			/// consolidate:
			var sid = parseInt(i.body.sid);
			api.getStar(sid, function(err, star) {
				if(err) {
					///
					return false;
				}

				// if(!i.user || (i.user.id != star.creatorId && i.user.lv != 7)) {
				if(!i.user || i.user.lv != 7) {
					o.json({ error: "not logged in" });
					return false;
				}

				api.renameStar(sid, i.body.creatorName, function(err, result) {
					if(err) {
						o.json({ error: "couldn't move..." }); ///
						return false;
					}

					o.json({ error: 0 });
				});
			});
		} break;

		case 'deleteStar': {
			/// consolidate:
			var starID = parseInt(i.body.starID);
			console.log(starID);

			api.getStar(starID, function(err, star) {
				if(err) {
					///
					o.json({ error: "couldn't get star" });
					return false;
				}

				// if(!i.user || (i.user.id != star.creatorId && i.user.lv != 7)) {
				if(!i.user || i.user.lv != 7) {
					o.json({ error: "not logged in" });
					return false;
				}

				api.deleteStar(starID, function(err, result) {
					if(err) {
						o.json({ error: "couldn't delete" }); ///
						return false;
					}

					console.log('no error');
					o.json({ error: 0 });
				});
			});
		} break;


		case 'settings': { /// naming (need to rename element id of form in current architecture)
			if(!i.user) {
				o.json({ error: "not logged in" });
				return false;
			}

			api.updateProfile(i.user.id, i.body, function(err, result) {
				if(err) {
					o.json({ error: err }); ///
					return false;
				}

				o.json({ error: 0 });
			});
		} break;

		case 'recolor': {
			/// consolidate:
			var sid = parseInt(i.body.sid);
			api.getStar(sid, function(err, star) {
				if(err) {
					///
					return false;
				}

				// if(!i.user || (i.user.id != star.creatorId && i.user.lv != 7)) {
				if(!i.user || i.user.lv != 7) {
					o.json({ error: "not logged in" });
					return false;
				}

				api.recolor(sid, i.body.rgb, function(err, result) {
					if(err) {
						o.json({ error: "couldn't move..." }); ///
						return false;
					}

					o.json({ error: 0 });
				});
			});
		} break;


		case 'move': {
			var sid = parseInt(i.body.sid);
			api.getStar(sid, function(err, star) {
				if(err) {
					///
					return false;
				}

				// if(!i.user || (i.user.id != star.creatorId && i.user.lv != 7)) {
				if(!i.user || i.user.lv != 7) {
					o.json({ error: "not logged in" });
					return false;
				}

				var x = parseInt(i.body.x);
				var y = -1 * parseInt(i.body.y);

				api.move(sid, x, y, function(err, result) {
					if(err) {
						o.json({ error: "couldn't move..." }); ///
						return false;
					}

					o.json({ error: 0 });
				});
			});
		} break;

		default: {
			/// log something maybe

			o.json({ error: "unhandled ajax operation: " +  i.params.operation}); /// safe to let people know?
		}
	}
}
