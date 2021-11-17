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

			console.log(telepUser);

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
		req.body.displayName,
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
 * Attempt to log user in using a session code, if they have one. Sets req.user
 * to a TelepUser representing authenticated user if there was one.
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 **/
function observeSessionCookie(req, res, next) {
	return api.getUserBySessionCode(req.cookies.session_code)
		.then(telepUser => {
			// User is either TelepUser or false:
			req.user = telepUser;

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

