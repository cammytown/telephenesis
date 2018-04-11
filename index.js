const express = require('express');
var session = require('express-session');
// var bcrypt = require('bcrypt-nodejs'); /// best?
var bcrypt = require('bcrypt-nodejs'); /// best?
var validator = require('validator'); /// best?
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var MongoClient = require('mongodb').MongoClient;
var MongoStore = require('connect-mongo')(session);
var multer = require('multer');
var upload = multer({ dest: 'uploads/' });
var fs = require('fs');
const Lame = require('node-lame').Lame;
// var connect = require('connect');
// var timeout = require('connect-timeout');

const app = express();

var Usr = require('./Usr.js');
var usr;

var Telep = require('./Telep.js');

var config = require('./telep.config.js');

app.set('views', './views');
app.set('view engine', 'jade');
app.use(express.static('public'));

app.use(bodyParser.json({ limit: "2400mb" }));
app.use(bodyParser.urlencoded({ limit: "2400mb", extended: true }));

app.use(cookieParser(config.sessionSecret));

// app.use(function(i, o, n) {
// 	n();
// });

// app.use(function(i, o, n) { ///
// 	// console.log('Time:', Date.now());
// 	n();
// });

var db;
MongoClient.connect("mongodb://localhost:27017", function(error, client) {
	if(error) {
		console.log(error);
		return false;
	}

	db = client.db('telephenesis');

	usr = new Usr(db, validator, bcrypt, );
	telep = new Telep(db, Lame);

	// testcollection = db.collection('test');

	init();
});

function init() {
	/// placement?:
	app.use(session({
		secret: config.sessionSecret, ////
		resave: false,
		saveUninitialized: false, ///
		store: new MongoStore({
			url: "mongodb://localhost:27017/telephenesis",
			// db: db /// ??? not working?
		})
		//cookie: { secure: true } /// HTTPS only
	}));


	app.use(function(i, o, n) {
		usr.in(i.cookies.usr_ss, function(user) {
			i.user = user;

			if(user) {
				telep.getUsrMeta(i.user.id, function(doc) {
					i.user.usrMeta = doc;
					n();
				});
			} else {
				n();
			}

		});
	});

	app.post('/ajax/upload/:starid', upload.single('submission'), function(i, o) { /// could maybe just use .post('/create/:starid')
		if(!i.user) {
			o.json({ error: "not logged in" });
			return false; ///
		}

		if(!i.user.lv) {
			o.json({ error: "no creator credentials" });
			return false; ///
		}

		/// consider putting objects in memory if we care about deep optimization later https://github.com/expressjs/multer#memorystorage

		var starId = parseInt(i.params.starid);

		///:
		if(starId > 0) { ///
			telep.getStar(starId, function(err, sourceStar) {
				telep.createStar(i.user.id, sourceStar, i.file, function(star) {
					o.json({ error: 0, sid: star.id });
				});
			});
		} else {
			telep.createStar(i.user.id, false, i.file, function(star) {
				o.json({ error: 0, sid: star.id });
			});
		}

		// src.on('error', function(err) {
		// 	o.json({ error: 1 });
		// });

		// if(!$ajax->upload(i.user.id, i.params.starid, i.file))
		// o.json({ error: "did not upload" });
		// break;
	});

	// app.post('/create', function(i, o)) {}

	app.post('/ajax/:operation', function(i, o) {
		switch(i.params.operation) {
			// case 'upload': {
			// 	if(!i.user) {
			// 		o.send('{ "error": "not logged in" }');
			// 		return false; ///
			// 	}

			// 	$lsid = $v;
			// 	$file = $_FILES['i'];
			// 	if(!$ajax->upload($user['id'], $lsid, $file))
			// 		echo '{ "error": "did not upload" }';
			// 	break;
			// } break;

			case 'renameStar': {
				/// consolidate:
				var sid = parseInt(i.body.sid);
				telep.getStar(sid, function(err, star) {
					if(err) {
						///
						return false;
					}

					// if(!i.user || (i.user.id != star.creatorId && i.user.lv != 7)) {
					if(!i.user || i.user.lv != 7) {
						o.json({ error: "not logged in" });
						return false;
					}

					telep.renameStar(sid, i.body.creatorName, function(err, result) {
						if(err) {
							o.json({ error: "couldn't move..." }); ///
							return false;
						}

						o.json({ error: 0 });
					});
				});			
			} break;

			case 'bookmark': {
				var sid = parseInt(i.body.sid);
				telep.getStar(sid, function(err, star) {
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

					telep.bookmark(star, i.user.id, function(err, result) {
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

			case 'recolor': {
				/// consolidate:
				var sid = parseInt(i.body.sid);
				telep.getStar(sid, function(err, star) {
					if(err) {
						///
						return false;
					}

					// if(!i.user || (i.user.id != star.creatorId && i.user.lv != 7)) {
					if(!i.user || i.user.lv != 7) {
						o.json({ error: "not logged in" });
						return false;
					}

					telep.recolor(sid, i.body.rgb, function(err, result) {
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
				telep.getStar(sid, function(err, star) {
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

					telep.move(sid, x, y, function(err, result) {
						if(err) {
							o.json({ error: "couldn't move..." }); ///
							return false;
						}

						o.json({ error: 0 });
					});
				});
			} break;

			case 'place': {
				var sid = parseInt(i.body.sid);
				telep.getStar(sid, function(err, star) {
					if(err) {
						///
						return false;
					}

					if(!i.user || i.user.id != star.creatorId) {
						o.json({ error: "not logged in" });
						return false;
					}

					var x = parseInt(i.body.x);
					var y = -1 * parseInt(i.body.y);
					var rgb = i.body.rgb;

					telep.place(sid, x, y, rgb, function(err, result) {
						if(err) {
							o.json({ error: "did not place" });
							return false;
						}

						if(star.lsid) {
							// $lstar = telep.sid($star['lsid']);
							// $luser = $usr->gt($lstar['uid']);
							// $lmeta = telep.meta($lstar['uid']);

							// $content = "Hello, ".$lmeta['name'].".\n\n";
							// $content .= "Someone has recreated your star on Telephenesis! Check it out here:\n\n";
							// $content .= URL.'/'.$sid."\n\n";
							// $content .= "Exciting!\n\n";
							// $content .= "Don't want these messages? Just reply to this email letting us know."; ///

							// telep.email($luser['em'], 'Someone recreated your star', $content);
						}

						// o.json({ creator: umeta.name });
						o.json({ error: 0 });
					});
				});

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
							o.cookie('usr_ss', sessionCode, {
								// secure: true /// https only
							});

							// console.log(results._id);

							// console.log(souls);
							// console.log(result);
							// console.log(err);
							o.json({ error: 0 });
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
	});

	app.post('/register', function(i, o) {
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
	});

	app.post('/login', function(i, o) {
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
	});

	app.get('/:page', function(i, o) {
		var realPages = ['help', 'login', 'register', 'settings'];

		if(
			realPages.indexOf(i.params.page) == -1
			&& isNaN(parseInt(i.params.page))
		) { /// isNaN necessary?
			o.status(404).send("Sorry, no page exists there."); ///
		} else {
			telep.getPlanets(i.user, function(planets) { /// consolidate
				o.render('main', {
					pageTitle: 'telephenesis : ' + i.params.page, /// not if it is a number
					planets,
					user: i.user
				});
			});
		}
	});

	app.get('/', (i, o) => {
		telep.getPlanets(i.user, function(planets) {
			o.render('main', {
				pageTitle: 'telephenesis : musical exploration',
				planets,
				user: i.user
			});
		});
	});
}

if(app.get('env') == 'production') {
	app.set('trust proxy', 'loopback');
}

app.listen(config.port, () => console.log('telephenesis: listening on port ' + config.port));
