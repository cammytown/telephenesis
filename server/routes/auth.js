const express = require('express');
//const Telep = require('../components/TelepServer');

///REVISIT weird architecture so we can access api without circular reference:
var api;
var usr;
function generate(telepServer) { 
	api = telepServer.api;
	usr = telepServer.usr;

	var authRouter = express.Router();
	//authRouter.post('/moveStar', moveStar);
	return authRouter;

}

function login(req, res, next) {
	return usr.li(req.body.email, req.body.password, req.ip)
		.then(userDoc => {
			res.cookie('usr_ss', userDoc.ss, {
				// secure: true /// https only
			});

			return usr.in(userDoc.ss);
		})
		.then(user => {
			if(user) {
				req.user = user;
			} else {
				
			}
		})
		.then(next)
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
		.then(() => next())
		.catch(err => next(err));
		// .catch(err => {
		// 	// res.json({ error: err });
		// 	res.json({ error: err });
		// });
}

function logout(req, res, next) {
	res.clearCookie('usr_ss', {});

	///TODO confine json responses to ./ajax.js i think
	res.json({ errors: false });

	next();
}


///TODO improve architecture:
module.exports = {
	generate,
	//authRouter,
	login,
	register,
	logout,
}

