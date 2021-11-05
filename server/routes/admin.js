const express = require('express');

var adminRouter = express.Router();

adminRouter.post('/moveStar', moveStar);

function moveStar() {
}

export default adminRouter;
