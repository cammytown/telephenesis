const express = require('express');
const stars = require('../components/StarMapper');
const admin = require('../components/AdminMapper');

function generate(responseType = "json") {
	///TODO not currently using responseType... all admin actions are done in ajax.

	var adminRouter = express.Router();
	adminRouter.use(validateAdminUser);
	adminRouter.post('/moveStar', moveStar, success);
	adminRouter.post('/deleteStar', deleteStar, success);
	adminRouter.post('/updateDBSchemas/:schema', updateDBSchemas, success);

	return adminRouter;
}

function success(req, res, next) {
	res.json({ errors: [] });
}

function validateAdminUser(req, res, next) {
	if(!user || user.lv != 7) {
		///@REVISIT
		next("Not authorized");
	} else {
		next();
	}
}

function moveStar(req, res, next) {
	return stars.moveStar(req.body.starID, req.body.x, req.body.y)
		.then(() => next())
		.catch(err => {
			///TODO
			//throw err;
			next(err);
		});
}

function deleteStar(req, res, next) {
	return stars.deleteStar(req.body.starID)
		.then(() => next())
		.catch(err => next(err));
}

function updateDBSchemas(req, res, next) {
	return admin.updateDBSchemas([req.params.schema])
		.then(() => next())
		.catch(err => next(err));
}

module.exports = { generate };

//export default adminRouter;
