const express = require('express');

const session = require('express-session');
// const bcrypt = require('bcrypt-nodejs'); /// best?
const bcrypt = require('bcrypt-nodejs'); /// best?
const validator = require('validator'); /// best?

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const MongoClient = require('mongodb').MongoClient;
const MongoStore = require('connect-mongo')(session);

const fs = require('fs');
// const Lame = require('node-lame').Lame;
// var connect = require('connect');
// var timeout = require('connect-timeout');

const routes = require('./routes');

const app = express();

var Usr = require('./Usr.js');
var usr;

var TelepAPI = require('./TelepAPI.js');

var config = require('./telepServer.config.js');

app.set('views', './views');
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/../public'));

app.use(bodyParser.json({ limit: "2400mb" }));
app.use(bodyParser.urlencoded({ limit: "2400mb", extended: true }));
app.use(cookieParser(config.sessionSecret));

var db;
MongoClient.connect("mongodb://mongo:27017", { useUnifiedTopology: true }, function(error, client) {
	if(error) {
		console.log(error);
		return false;
	}

	db = client.db('telephenesis');
	usr = new Usr(db, validator, bcrypt);
	api = new TelepAPI(db);

	console.log("Database connection established. Initializing Telephenesis...")

	initialize();
});

function initialize() {
	/// placement?:
	
	app.use(session({
		secret: config.sessionSecret, ////
		resave: false,
		saveUninitialized: false, ///
		store: new MongoStore({
			url: "mongodb://mongo:27017/telephenesis",
			// db: db /// ??? not working?
		})
		//cookie: { secure: true } /// HTTPS only
	}));

	app.use(function(i, o, n) {
		console.log(i.originalUrl);

		usr.in(i.cookies.usr_ss, function(user) {
			i.user = user;

			if(user) {
				api.getUsrMeta(i.user.id, function(err, usrMeta) {
					if(err) {
						o.status(404).send("There was a problem retrieving your account in our system. Please email us at contact@telephenesis.com"); ///
					}

					i.user.usrMeta = usrMeta;
					n();
				});
			} else {
				i.user.usrMeta = {}; ///
				n();
			}
		});
	});

	routes.initializeRoutes(app);
}

if(app.get('env') == 'production') {
	app.set('trust proxy', 'loopback');
}

app.listen(config.port, () => console.log('telephenesis: listening on port ' + config.port));
