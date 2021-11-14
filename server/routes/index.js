const express = require('express');
const HTMLParser = require('node-html-parser');
const multer = require('multer');
const upload = multer({ dest: __dirname + '/../uploads/' });

const ServerStar = require('../components/ServerStar.js');
const api = require('../components/TelepAPI');
const Stars = require('../components/StarMapper');
const CONSTS = require('../../abstract/constants.js');

const authRouter = require('./auth');
const ajaxRouter = require('./ajax');
const adminRouter = require('./admin');


function TelepRouter() {
	var me = this;

	this.usr = null;
	this.app = null;
	//this.api = null;

	this.ready = function(server) {
		me.usr = server.usr;

		///REVISIT architecture:
		me.app = server.app;

		// Accept multipart form data (FormData):
		me.app.use(upload.array()); ///REVISIT move into TelepServer somehow?

		// Debug purposes:
		////TODO add a flag:
		me.app.use((req, res, next) => {
			console.log("client visited: " + req.url);
			//console.log(req.body);
			next();
		});

		// Get user if logged in.
		me.app.use(authRouter.observeSessionCookie);

		///REVISIT because ajaxRouter references authRouter, auth.generate()
		//must be called first so that api is available. The
		//semantics/architecture of this feels really bad to me. Improve;
		//probably just refactor how we do routing?
		me.app.use('/auth', authRouter.generate(server));
		me.app.use('/ajax', ajaxRouter.generate(server));
		//me.app.use('/admin', adminRouter.generate());

		// me.app.post('/register', register);
		// me.app.post('/login', login);

		me.app.get('/:page?', main);
		me.app.get('/:page/:starID', main); ////REVISIT architecture
		//me.app.get('/star/:starID', main);
		//me.app.get('/recreate/:starID', main);
	}

	function uploadMedia(req, res) { /// could maybe just use .post('/create/:starid')
	// me.app.post('/ajax/upload/:starid', api.auth('creator'), upload.single('submission'), function(i, o) { /// could maybe just use .post('/create/:starid')
		/// consider putting objects in memory if we care about deep optimization later https://github.com/expressjs/multer#memorystorage

		return false; ///REVISIT uploading not currently allowed

		var starId = parseInt(req.params.starid);

		///:
		if(starId != -1) { ///
			Stars.getStar(starId, function(err, originStar) {
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
		var realPages = [
			'star',
			'about',
			'help',

			'login',
			'register',

			'settings',

			'create',
			'recreate',
		];


		var className = '';
		if(req.user) {
			className += ' in';

			//if(req.user.lv > 0) {
				className += ' creator';
			//}

			if(req.user.lv == 7) {
				className += ' adminor';
			}
		}

		if(
			req.params.page !== undefined ///REVISIT best check?
			&& realPages.indexOf(req.params.page) == -1
			&& isNaN(parseInt(req.params.page))
		) { /// isNaN necessary?
			res.status(404).send("Sorry, no page exists there."); ///
		} else {
			return Stars.getStars(req.user)
				.then(stars => { /// consolidate
					me.app.render('main', {
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
				Stars.getStar(starID, function(err, star) {
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

				Stars.getStar(starID, function(err, star) {
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
				Stars.getStar(starID, function(err, star) {
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
				Stars.getStar(starID, function(err, star) {
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

}

module.exports = new TelepRouter();

