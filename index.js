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

const app = express();

var Usr = require('./Usr.js');
var usr;

var Telep = require('./Telep.js');

var config = require('./telep.config.js');

app.set('views', './views');
app.set('view engine', 'jade');
app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser(config.sessionSecret));

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
	console.log('someone connected');

	usr.in(i.cookies.usr_ss, function(user) {
		i.user = user;
		n();
	});
});

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
	telep = new Telep(db);

	// testcollection = db.collection('test');
});

app.post('/ajax/upload/:starid', upload.single('submission'), function(i, o) { /// could maybe just use .post('/create/:starid')
	if(!i.user) {
		o.json({ error: "not logged in" });
		return false; ///
	}


	// src.pipe(dest);
	// src.on('end', function() {
		var tmp_path = i.file.path;
		// var src = fs.createReadStream(tmp_path);
		// var dest = fs.createWriteStream(target_path);

		var starId = parseInt(i.params.starid);

		///:
		if(starId > 0) { ///
			telep.getStar(starId, function(err, sourceStar) {
				telep.createStar(i.user.id, sourceStar, function(star) {
					var target_path = 'public/music/' + star.id + '.mp3';
					fs.copyFile(tmp_path, target_path, function(err) {
						if(err) {
							console.log(err);
							///
						}
					});

					o.json({ error: 0, sid: star.id });
				});
			});
		} else {
			telep.createStar(i.user.id, false, function(star) {
				var target_path = 'public/music/' + star.id + '.mp3';
				fs.copyFile(tmp_path, target_path, function(err) {
					if(err) {
						console.log(err);
						///
					}
				});

				o.json({ error: 0, sid: star.id });
			});
		}

	// });

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

		case 'place': {
			var sid = parseInt(i.body.sid)
			telep.getStar(sid, function(err, star) {
				if(err) {
					///
					return false;
				}

				if(!i.user || i.user.id != star.uid) {
					o.json({ error: "not logged in" });
					return false;
				}

				var x = parseInt(i.body.x);
				var y = -1 * parseInt(i.body.y);
				var rgb = i.body.rgb;

				telep.place(sid, x, y, rgb, function(err, result) {
					if(err) {
						o.json({ error: "did not place" });
						// exit(); ///
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
						o.render('login', { p: i.body, errors: err });
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

app.get('/', (i, o) => {
	telep.getPlanets(false, function(planets) {
		o.render('main', {
			pageTitle: 'telephenesis : musical exploration',
			planets,
			user: i.user
		});
	});
});

app.listen(config.port, () => console.log('telephenesis: listening on port ' + config.port));
