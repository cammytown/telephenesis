const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoClient = require('mongodb').MongoClient;
const MongoStore = require('connect-mongo')(session);
const bcrypt = require('bcrypt-nodejs'); /// best?
const validator = require('validator'); /// best?

const Usr = require('../libs/Usr.js'); ///REVISIT Usr or usr? changes between files...

const TelepAPI = require('./TelepAPI.js');
const StarMapper = require('./StarMapper');
const TelepRouter = require('../routes'); ///REVISIT have a TelepRouter in components/ ?
const serverConfig = require('../telepServer.config.js');

/**
 * Central component of the server which initializes the database connection, API, and networking.
 * @constructor
 **/
function TelepServer() {
	var me = this;

	///REVISIT architecture:
	this.app;
	this.db;
	this.usr;
	this.persistorDoc;
	//this.api;
	var components = [];

	this.initialize = function() {
		console.log("initializing telephenesis...");

		initializeDatabase()
		.then(initializeExpress)
		.then(initializeTelep)
		.then(initializeComponents)
		.then(exposeServer)
		.catch(err => {
			console.error(err); ///
			throw new Error(err);
		});
	}

	//this.addComponent = function(component) {
		//components
	//}

	function initializeDatabase() {
		return MongoClient.connect("mongodb://mongo:27017", { useUnifiedTopology: true })
			.then(mongoClient => {
				console.log("Database connection established.");
				me.db = mongoClient.db('telephenesis');

				// Retrieve or create persistorDoc:
				///TODO maybe refactor into a database initialization file/method
				var MLMeta = me.db.collection('MLMeta');
				return MLMeta.find({ id: 'persistors' }).limit(1).next()
					.then(persistorDoc => {
						if(!persistorDoc) {
							me.persistorDoc = {
								id: 'persistors',
								userIndex: 1,
								constellationCount: 0,
								starCount: 0
							}

							MLMeta.insertOne(me.persistorDoc);
						} else {
							me.persistorDoc = persistorDoc;
						}

					})
					.catch(err => {
						///REVISIT
						throw err;
					});
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

		///REVISIT i've heard we should use something other than express to serve static files:
		app.use(express.static(__dirname + '/../../public'));

		app.use(bodyParser.json({ limit: "2400mb" }));
		app.use(bodyParser.urlencoded({ limit: "2400mb", extended: true }));
		app.use(cookieParser(serverConfig.sessionSecret));

		me.app = app;

		return true;
	}

	function initializeTelep() {
		///TODO have a generic component initialization method like we
		//do on the client:

		me.usr = new Usr(me.db, validator, bcrypt);
		console.log("usr initialized");

		// Setup user session data storage:
		me.app.use(session({
			///TODO document these options:

			secret: serverConfig.sessionSecret, ////
			resave: false,
			saveUninitialized: false, ///
			store: new MongoStore({
				url: "mongodb://mongo:27017/telephenesis",
				// db: db /// ??? not working?
			})
			//cookie: { secure: true } /// HTTPS only
		}));

		components.push(TelepAPI);
		components.push(StarMapper);
		components.push(TelepRouter);

		return true;
	}

	function initializeComponents() {
		for(var component of components) {
			// If component has initialize method, run it:
			if(typeof component.initialize === 'function') {
				component.initialize(me); ///REVISIT on clientState we use .init() ... keep consistent?
			}
		}

		for(var component of components) {
			///REVISIT does passing `me` in impact performance?
			//doing this in case people don't want to write an
			//initialize function but want ref to server:
			// If component has ready method, run it:
			if(typeof component.ready === 'function') {
				component.ready(me);
			}
		}

	}

	function exposeServer() {
		if(me.app.get('env') == 'production') {
			me.app.set('trust proxy', 'loopback');
		}

		me.app.listen(
			serverConfig.port,
			() => console.log('telephenesis: listening on port ' + serverConfig.port)
		);
	}
}

module.exports = new TelepServer();

