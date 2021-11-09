const express = require('express');

function generate() {
	var adminRouter = express.Router();
	adminRouter.post('/moveStar', moveStar);

	return adminRouter;
}

function moveStar() {
}

module.exports = { generate };

//export default adminRouter;
