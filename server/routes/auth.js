const express = require('express');

var authRouter = express.Router();
//authRouter.post('/moveStar', moveStar);

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

	res.json({ errors: false });
}


module.exports = {
	authRouter,
}
