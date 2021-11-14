const express = require('express');
//const Telep = require('../components/TelepServer');
const api = require('../components/TelepAPI');

///REVISIT weird architecture so we can access api without circular reference:
//var api;
var usr;
function generate(telepServer) {
	//api = telepServer.api;
	usr = telepServer.usr;

	var authRouter = express.Router();
	//authRouter.post('/moveStar', moveStar);
	return authRouter;

}

function login(req, res, next) {
	return api.login(req.body.email, req.body.password, req.ip)
		.then(telepUser => {
			// Send cookie to client for saving:
			res.cookie('session_code', telepUser.sessionCode, {
				// secure: true /// https only
			});

			req.user = telepUser;
			next();
		})
		//.then(observeSessionCode)
		.catch(errors => {
			// res.render('login', { p: req.body, errors: err });
			console.error(errors);
//const htmlparser2 = require('htmlparser2');
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
		//.then(observeSessionCode)
		.then(newUser => {
			req.user = newUser;
			next();
		})
		.catch(err => next(err));
		// .catch(err => {
		// 	// res.json({ error: err });
		// 	res.json({ error: err });
		// });
}

function logout(req, res, next) {
	res.clearCookie('session_code', {});

	///TODO confine json responses to ./ajax.js i think
	res.json({ errors: []});

	//next();
}

/**
 * Retrieve a user using their session code.
 * @param {string} sessionCode
 **/
function getUserSession(sessionCode) {
	return usr.in(sessionCode)
		.then(user => {
			// If successfully logged in using session code:
			if(user) {
				// Get user meta information:
				return api.getUserMeta(user.id)
					.then(usrMeta => {
						// Attach meta info to user object:
						Object.assign(user, usrMeta);
						//next();
						return user;
					})
					.catch(err => {
						if(err) {
							throw err;
						}
					});
			} else {
				//throw "No user with that session code.";
				// req.user = {}; ///
				//next();
				return false;
			}
		});
}

/**
 * Attempt to log user in using a session code, if they have one.
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 **/
function observeSessionCookie(req, res, next) {
	return getUserSession(req.cookies.session_code)
		.then(user => {
			// User is either TelepUser or false:
			req.user = user;

			next();
		})
		.catch(err => next(err));
}



///TODO improve architecture:
module.exports = {
	generate,
	//authRouter,
	login,
	register,
	logout,
	observeSessionCookie,
}

