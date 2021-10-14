const express = require('express');
const multer = require('multer');
const upload = multer({ dest: __dirname + '/../uploads/' });

module.exports = {
	initializeRoutes
};

function initializeRoutes(app) {
	var ajaxRouter = express.Router();
	ajaxRouter.post('/sync', syncWithClient);
	ajaxRouter.post('/upload/:starid', api.auth('creator'), upload.single('submission'), uploadMedia);

	app.use('/ajax', ajaxRouter);

	app.post('/register', register);
	app.post('/login', login);

	app.get('/:page?', main);
}

// var ajaxOpRouter = express.Router({ mergeParams: true });
// ajaxRouter.use('/:operation', upload.none(), ajaxOpRouter);



function syncWithClient(req, res) {
	console.log("test");

	res.json({ error: false });
}


function uploadMedia(req, res) { /// could maybe just use .post('/create/:starid')
// app.post('/ajax/upload/:starid', api.auth('creator'), upload.single('submission'), function(i, o) { /// could maybe just use .post('/create/:starid')
	/// consider putting objects in memory if we care about deep optimization later https://github.com/expressjs/multer#memorystorage

	return false; ///REVISIT uploading not currently allowed

	var starId = parseInt(req.params.starid);

	///:
	if(starId != -1) { ///
		apreq.getStar(starId, function(err, originStar) {
			apreq.createStar(req.user.id, {
				originStar,
				multerFile: req.file,
				callback: function(star) {
					res.json({ error: 0, sid: star.id });
				}
			});
		});
	} else {
		apreq.createStar(req.user.id, {
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




// app.get('/', (i, o) => {
// 	api.getStars(i.user, function(stars) {
// 		var className = "";
// 		if(i.user) {
// 			className = "in";

// 			if(i.user.lv > 0) {
// 				className += " creator";
// 			} else if(i.user.lv == 7) {
// 				className += " adminor";
// 			}
// 		}

// 		o.render('main', {
// 			pageTitle: 'telephenesis : musical exploration',
// 			className,
// 			stars,
// 			user: i.user
// 		});
// 	});
// });

function main(i, o) {
	var realPages = ['help', 'login', 'register', 'settings', 'create'];

	var className = "";
	if(i.user) {
		className = "in";

		if(i.user.lv > 0) {
			className += " creator";
		} else if(i.user.lv == 7) {
			className += " adminor";
		}
	}

	if(
		i.params.page !== undefined ///REVISIT best check?
		&& realPages.indexOf(i.params.page) == -1
		&& isNaN(parseInt(i.params.page))
	) { /// isNaN necessary?
		o.status(404).send("Sorry, no page exists there."); ///
	} else {
		api.getStars(i.user, function(stars) { /// consolidate
			o.render('main', {
				pageTitle: 'telephenesis : ' + i.params.page, /// not if it is a number
				className,
				stars,
				user: i.user
			});
		});
	}
}

function login(i, o) {
	usr.li(
		i.body.email,
		i.body.password,
		i.ip,
		function(err, ss) {
			if(err.length) {
				o.render('login', { p: i.body, errors: err });
			} else {
				o.cookie('usr_ss', ss, {
					// secure: true /// https only
				});

				o.send('LOGGED EM');
			}
		}
	);
}

function register(i, o) {
	i.body['password'] == i.body['password-confirm'];

	var uid = usr.rg(
		i.body.email,
		i.body.password,
		i.ip,
		function(err, usrDoc, ss) {
			if(err.length) {
				o.render('register', { p: i.body, errors: err });
			} else {
				o.cookie('usr_ss', ss, {
					// secure: true /// https only
				});

				// console.log(results._id);

				// console.log(souls);
				// console.log(result);
				// console.log(err);
				o.send('got em');
			}
		}
	);
}

function ajaxOp(i, o) {
	switch(i.params.operation) {
		// case 'create': {
		// 	// if(!i.user || (i.user.id != star.creatorId && i.user.lv != 7)) {
		// 	if(!i.user) {
		// 		o.json({ error: "not logged in" });
		// 		return false;
		// 	}

		// 	// var gameProperties = {
		// 	// 	access: i.body['access-setting'],
		// 	// 	timeLimit: i.body['time-limit'],
		// 	// 	artType: i.body['art-type'],
		// 	// };

		// 	var genesisStar = {
		// 		artURL: i.body['file-url'],
		// 		artType: i.body['art-type'],
		// 		artTitle: i.body['art-title']
		// 	};

		// 	api.createStar(i.user.id, genesisStar);
		// } break;

		// case 'recreate': {
		// 	// if(!i.user || (i.user.id != star.creatorId && i.user.lv != 7)) {
		// 	if(!i.user) {
		// 		o.json({ error: "not logged in" });
		// 		return false;
		// 	}

		// 	// var gameProperties = {
		// 	// 	access: i.body['access-setting'],
		// 	// 	timeLimit: i.body['time-limit'],
		// 	// 	artType: i.body['art-type'],
		// 	// };

		// 	var recreationStar = {
		// 		originStarId: i.body['source-star-id'],
		// 		artURL: i.body['file-url'],
		// 		artType: i.body['art-type'],
		// 		artTitle: i.body['art-title']
		// 	};

		// 	api.createStar(i.user.id, recreationStar);
		// } break;

		/**
		 * This method runs somewhat regularly and handles basic exchange
		 * of information between client and server. The server informs the
		 * client of new stars, and the client informs the server of
		 * media plays, etc.
		 */
		case 'update': { ///REVISIT naming
			// api.
			i.body.shortPlays;
			i.body.longPlays;
			// for (var updateIndex = 0; updateIndex < i.body.serverUpdates.length; updateIndex++) {
			// 	var updateObject = i.body.serverUpdates[updateIndex];
			// 	switch(updateObject.type) {
			// 		case 'partialPlay':
			// 		case 'longPlay': {
			// 			console.log(updateObject)
			// 		} break;
			// 	}
			// }

			o.json({ error: 0 });
		} break;

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

		case 'bookmark': {
			var sid = parseInt(i.body.sid);
			api.getStar(sid, function(err, star) {
				if(err) {
					///
					console.error(err);
					return false;
				}

				// if(!i.user || (i.user.id != star.creatorId && i.user.lv != 7)) {
				if(!i.user) {
					o.json({ error: "not logged in" });
					return false;
				}

				api.bookmark(star, i.user.id, function(err, result) {
					if(err) {
						///
						console.error(err);
						o.json({ error: "couldn't bookmark..." }); ///
						return false;
					}

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

		case 'actualize': {
			if(!i.user || i.user.lv != 7) {
				o.json({ error: "not logged in" });
				return false;
			}

			var starID = parseInt(i.body.starID);

			switch(i.body.hostType) {
				case 'external': {
					var starData = {
						starID: i.body.starID,
						x: parseInt(i.body.x),
						y: parseInt(i.body.y),
						color: i.body.color,
						originStarID: parseInt(i.body.originStarID),
						hostType: i.body.hostType,
						fileURL: i.body.fileURL,
						title: i.body.starTitle
					};

					api.createStar(i.user.id, starData, function(err, result) {
						if(err) {
							console.log(err); ///
							o.json({ error: "could not create star" });
							return false;
						}

						o.json({ error: 0 });
					});

					// api.actualize(starData, function(err, result) {
					// 	if(err) {
					// 		o.json({ error: "did not place" });
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

					// 	// o.json({ creator: umeta.name });
					// 	o.json({ error: 0 });
					// });
				} break;

				case 'upload': {
					// star should already have been created ///REVISIT architecture; maybe it would be better to just have some token associated to the upload that we use when creating the star
				} break;

				default: {
					console.log('unhandled hostType: ' + i.body.hostType);
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

		} break;

		case 'login': {
			usr.li(
				i.body.email,
				i.body.password,
				i.ip,
				function(err, sessionCode) {
					if(err.length) {
						o.json({ error: err });
						// o.render('login', { p: i.body, errors: err });
					} else {
						o.cookie('usr_ss', sessionCode, {
							// secure: true /// https only
						});

						o.json({ error: 0 });
					}
				}
			);
		} break;

		case 'register': {
			i.body['password'] == i.body['password-confirm'];

			var uid = usr.rg(
				i.body.email,
				i.body.password,
				i.ip,
				function(err, usrDoc, sessionCode) {
					if(err.length) {
						// o.render('register', { p: i.body, errors: err });
						o.json({ error: err });
					} else {
						api.createProfile({
							userID: usrDoc.id,
							email: i.body.email,
							creatorName: i.body.creatorName

						}, function() {
							o.cookie('usr_ss', sessionCode, {
								// secure: true //// https only
							});

							o.json({ error: 0 });
						});
					}
				}
			);
		} break;

		case 'logout': {
			o.clearCookie('usr_ss', {});

			o.json({ error: 0 });
		} break;

		default: {
			/// log something maybe

			o.json({ error: "unhandled ajax operation: " +  i.params.operation}); /// safe to let people know?
		}
	}
}
