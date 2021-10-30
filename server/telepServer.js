const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoClient = require('mongodb').MongoClient;
const MongoStore = require('connect-mongo')(session);
const bcrypt = require('bcrypt-nodejs'); /// best?
const validator = require('validator'); /// best?

const Usr = require('./libs/Usr.js');

const TelepAPI = require('./components/TelepAPI.js');
const routes = require('./routes');
// const config = require('./telepServer.config.js');

function TelepServer() {
	var me = this;

	///REVISIT architecture:
	me.config;
	me.app;
	me.db;
	me.usr;
	me.api;

	me.initialize = function() {
		me.config = require('./telepServer.config.js');

		initializeDatabase()
			.then(initializeExpress)
			.then(initializeTelep)
			.then(exposeServer)
			.catch(err => {
				console.error(err); ///
				throw new Error(err);
			});
	}

	function initializeDatabase() {
		return MongoClient.connect("mongodb://mongo:27017", { useUnifiedTopology: true })
			.then(mongoClient => {
				console.log("Database connection established.");
				me.db = mongoClient.db('telephenesis');
			})
			.catch(err => {
				console.error(err); ///
				throw new Error(err);
			});
	}

	function initializeExpress() {
		const app = express();

		app.set('views', './views');
		app.set('view engine', 'pug');
		app.use(express.static(__dirname + '/../public'));

		app.use(bodyParser.json({ limit: "2400mb" }));
		app.use(bodyParser.urlencoded({ limit: "2400mb", extended: true }));
		app.use(cookieParser(me.config.sessionSecret));

		me.app = app;

		return true;
	}

	function initializeTelep() {
		me.usr = new Usr(me.db, validator, bcrypt);
		me.api = new TelepAPI(me);

		me.app.use(session({
			secret: me.config.sessionSecret, ////
			resave: false,
			saveUninitialized: false, ///
			store: new MongoStore({
				url: "mongodb://mongo:27017/telephenesis",
				// db: db /// ??? not working?
			})
			//cookie: { secure: true } /// HTTPS only
		}));


		routes.initializeRoutes(me);

		return true;
	}

	function exposeServer() {
		if(me.app.get('env') == 'production') {
			me.app.set('trust proxy', 'loopback');
		}

		me.app.listen(me.config.port, () => console.log('telephenesis: listening on port ' + me.config.port));
	}
}

module.exports = new TelepServer();

