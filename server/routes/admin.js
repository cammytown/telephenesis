const express = require('express');
const Stars = require('../components/StarMapper');

function generate(responseType = "json") {
	///TODO not currently using responseType... all admin actions are done in ajax.

	var adminRouter = express.Router();
	adminRouter.post('/moveStar', moveStar, success);
	adminRouter.post('/deleteStar', deleteStar, success);
	adminRouter.post('/updateDBSchemas', updateDBSchemas, success);

	return adminRouter;
}

function success(req, res, next) {
	res.json({ errors: [] });
}

function moveStar(req, res, next) {
	return Stars.moveStar(req.body.starID, req.body.x, req.body.y)
		.then(() => next())
		.catch(err => {
			///TODO
			//throw err;
			next(err);
		});
}

function deleteStar(req, res, next) {
	return Stars.deleteStar(req.body.starID)
		.then(() => next())
		.catch(err => next(err));
}

function updateDBSchemas(req, res, next) {
	return Stars.updateDBSchemas()
		.then(() => next())
		.catch(err => next(err));
}

module.exports = { generate };

//export default adminRouter;
