const express = require('express');
const HTMLParser = require('node-html-parser');
const multer = require('multer');
const upload = multer({ dest: __dirname + '/../uploads/' });

const ServerStar = require('../components/ServerStar.js');
const CONSTS = require('../../abstract/constants.js');

const ajaxRoutes = require('./ajax');
const adminRoutes = require('./admin');
// const stars = require('./components/StarMapper.js');

// var telepServer = require('./components/TelepServer.js');
// const api = telepServer.api;

module.exports = {
	initializeRoutes,
	upload,
};

///REVISIT architecture:
var app;
var api;
var usr;

/** Setup routes; links URIs to the proper middlewares. **/
function initializeRoutes(telepServer) {
	///REVISIT architecture:
	app = telepServer.app;
	api = telepServer.api;
	usr = telepServer.usr;

	// Accept multipart form data (FormData):
	app.use(upload.array()); ///REVISIT move into TelepServer somehow?

	// Debug purposes:
	////TODO add a flag:
	app.use((req, res, next) => {
		console.log("client visited: " + req.url);
		//console.log(req.body);
		next();
	});

	// Get user if logged in.
	app.use(observeSessionCode);

	app.use('/ajax', ajaxRouter);
	app.use('/admin', adminRouter);

	// app.post('/register', register);
	// app.post('/login', login);

	app.get('/:page?', main);
}

/**
 * Attempt to log user in using a session code, if they have one. 
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 **/
function observeSessionCode(req, res, next) {
	return usr.in(req.cookies.usr_ss)
		.then(user => {
			req.user = user;

			if(user) {
				// Successfully logged in using session code.

				api.getUserMeta(req.user.id)
					.then(usrMeta => {
						Object.assign(req.user, usrMeta);
						//req.user = usrMeta;
						next();
						return user;
					})
					.catch(err => {
						if(err) {
							throw err;
						}
					});
			} else {
				// req.user = {}; ///
				next();
				return false;
			}
		})
		.catch(err => next(err));
}

function actualizeStar(req, res, next) {
	if(!req.user || req.user.lv != 7) {
		///REVISIT:
		res.json({ error: "Not logged in" });
		throw new Error("Not logged in");
	}

	switch(req.body.hostType) {
		case 'external': {
			var newStar = new ServerStar(req.body);

			// Create the star in the database:
			return api.createStar(req.user, newStar)
				.then(newStarDoc => {
					res.json({
						errors: false,
						creatorName: req.user.creatorName,
						newStarID: newStar.id,
						starMovements: newStarDoc.starMovements,
					});

					return true;
				})
				.catch(err => {
					//console.error(err); ///
					//res.json({ error: "Could not create star." }); ///TODO improve error
					//throw new Error(err);
					next(err);
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
	// 		o.json({ errors: false });
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
			api.createStar(req.user, {
				originStar,
				multerFile: req.file,
				callback: function(star) {
					res.json({ errors: false, starID: star.id });
				}
			});
		});
	} else {
		api.createStar(req.user, {
			multerFile: req.file,
			callback: function(star) {
				res.json({ errors: false, starID: star.id });
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
				app.render('main', {
					CONSTS: CONSTS,
					page: req.params.page,
					user: req.user,
					pageTitle: 'telephenesis : '
						+ (req.params.page ? req.params.page : 'a game of musical echoes'),
					className,
					stars,
					// popularitySort: JSON.stringify(),
				}, (err, html) => {
					if(err) {
						// There was a problem rendering the template:
						throw new Error(err);
					}

					// If URI goes to a particular page:
					if(req.params.page) {
						// Parse the rendered template:
						var domRoot = HTMLParser.parse(html);

						// Manipulate DOM according to page:
						var bodyEle = domRoot.getElementsByTagName('body')[0];
						var pageElement = domRoot.querySelector('#' + req.params.page + '-page');

						///REVISIT:
						if(!pageElement) {
							console.error("Telep: Found no page element for '" + req.params.page + '"');
						} else {
							// Remove page element from #limbo:
							pageElement.remove();

							// Move the page element from #limbo to body:
							bodyEle.appendChild(pageElement);
						}

						// Send the new HTML to client:
						res.send(domRoot.toString());

					// Else if no page, just send unaltered template:
					} else {
						res.send(html);
					}
				});
			})
			.catch(err => {
				console.error(err);
				res.status(404).send("Our website appears to be down. Sorry about that.");
			});
	}
}


function ajaxOp(i, o) {
	switch(i.params.operation) {
		case 'renameStar': {
			/// consolidate:
			var starID = parseInt(i.body.starID);
			api.getStar(starID, function(err, star) {
				if(err) {
					///
					return false;
				}

				// if(!i.user || (i.user.id != star.creatorId && i.user.lv != 7)) {
				if(!i.user || i.user.lv != 7) {
					o.json({ error: "not logged in" });
					return false;
				}

				api.renameStar(starID, i.body.creatorName, function(err, result) {
					if(err) {
						o.json({ error: "couldn't move..." }); ///
						return false;
					}

					o.json({ errors: false });
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
					o.json({ errors: false });
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

				o.json({ errors: false });
			});
		} break;

		case 'recolor': {
			/// consolidate:
			var starID = parseInt(i.body.starID);
			api.getStar(starID, function(err, star) {
				if(err) {
					///
					return false;
				}

				// if(!i.user || (i.user.id != star.creatorId && i.user.lv != 7)) {
				if(!i.user || i.user.lv != 7) {
					o.json({ error: "not logged in" });
					return false;
				}

				api.recolor(starID, i.body.rgb, function(err, result) {
					if(err) {
						o.json({ error: "couldn't move..." }); ///
						return false;
					}

					o.json({ errors: false });
				});
			});
		} break;


		case 'move': {
			var starID = parseInt(i.body.starID);
			api.getStar(starID, function(err, star) {
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

				api.move(starID, x, y, function(err, result) {
					if(err) {
						o.json({ error: "couldn't move..." }); ///
						return false;
					}

					o.json({ errors: false });
				});
			});
		} break;

		default: {
			/// log something maybe

			o.json({ error: "unhandled ajax operation: " +  i.params.operation}); /// safe to let people know?
		}
	}
}