const express = require('express');
const stars = require('../components/StarMapper');
const admin = require('../components/AdminMapper');
const config = require('../../config/telep.config.js');

function generate(responseType = "json") {
	///TODO not currently using responseType... all admin actions are done in ajax.

	var adminRouter = express.Router();
	adminRouter.use(validateAdminUser);
	adminRouter.get('/list-users', listUsers);
	adminRouter.post('/moveStar', moveStar, success);
	adminRouter.post('/deleteStar', deleteStar, success);
	adminRouter.post('/updateDBSchemas/:schema', updateDBSchemas, success);

	return adminRouter;
}

function success(req, res, next) { ///REVISIT improve naming/architecture
	res.json({ errors: [] });
}

function listUsers(req, res) {
	admin.getUsers()
		.then(users => {
			res.json({
				users,
			});
		});
}

function validateAdminUser(req, res, next) {
	if(!req.user || req.user.lv < config.adminLevel) {
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

function renameStar(starId, creatorName, callback) {
	dbStars.updateOne(
		{ id: starId },
		{ $set: { creatorName } },
		callback
	);
}

function recolor(starId, rgb, callback) {
	dbStars.updateOne(
		{ id: starId },
		{ $set: { rgb } },
		callback
	);
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


	//function ajaxOp(i, o) {
	//    switch(i.params.operation) {
	//        case 'renameStar': {
	//            /// consolidate:
	//            var starID = i.body.starID;
	//            Stars.getStar(starID, function(err, star) {
	//                if(err) {
	//                    ///
	//                    return false;
	//                }

	//                // if(!i.user || (i.user.id != star.creatorId && i.user.lv != 7)) {
	//                if(!i.user || i.user.lv != 7) {
	//                    o.json({ errors: ["not logged in"] });
	//                    return false;
	//                }

	//                api.renameStar(starID, i.body.creatorName, function(err, result) {
	//                    if(err) {
	//                        o.json({ errors: ["couldn't move..."] }); ///
	//                        return false;
	//                    }

	//                    o.json({ errors: false });
	//                });
	//            });
	//        } break;

	//        case 'deleteStar': {
	//            /// consolidate:
	//            var starID = i.body.starID;
	//            console.log(starID);

	//            Stars.getStar(starID, function(err, star) {
	//                if(err) {
	//                    ///
	//                    o.json({ errors: ["couldn't get star"] });
	//                    return false;
	//                }

	//                // if(!i.user || (i.user.id != star.creatorId && i.user.lv != 7)) {
	//                if(!i.user || i.user.lv != 7) {
	//                    o.json({ errors: ["not logged in"] });
	//                    return false;
	//                }

	//                api.deleteStar(starID, function(err, result) {
	//                    if(err) {
	//                        o.json({ errors: ["couldn't delete"] }); ///
	//                        return false;
	//                    }

	//                    console.log('no error');
	//                    o.json({ errors: false });
	//                });
	//            });
	//        } break;

	//        case 'recolor': {
	//            /// consolidate:
	//            var starID = i.body.starID;
	//            Stars.getStar(starID, function(err, star) {
	//                if(err) {
	//                    ///
	//                    return false;
	//                }

	//                // if(!i.user || (i.user.id != star.creatorId && i.user.lv != 7)) {
	//                if(!i.user || i.user.lv != 7) {
	//                    o.json({ errors: ["not logged in"] });
	//                    return false;
	//                }

	//                api.recolor(starID, i.body.rgb, function(err, result) {
	//                    if(err) {
	//                        o.json({ errors: ["couldn't move..."] }); ///
	//                        return false;
	//                    }

	//                    o.json({ errors: false });
	//                });
	//            });
	//        } break;


	//        case 'move': {
	//            var starID = i.body.starID;
	//            Stars.getStar(starID, function(err, star) {
	//                if(err) {
	//                    ///
	//                    return false;
	//                }

	//                // if(!i.user || (i.user.id != star.creatorId && i.user.lv != 7)) {
	//                if(!i.user || i.user.lv != 7) {
	//                    o.json({ errors: ["not logged in"] });
	//                    return false;
	//                }

	//                var x = parseInt(i.body.x);
	//                var y = -1 * parseInt(i.body.y);

	//                api.move(starID, x, y, function(err, result) {
	//                    if(err) {
	//                        o.json({ errors: ["couldn't move..."] }); ///
	//                        return false;
	//                    }

	//                    o.json({ errors: false });
	//                });
	//            });
	//        } break;

	//        default: {
	//            /// log something maybe

	//            o.json({ errors: ["unhandled ajax operation: " +  i.params.operation] }); /// safe to let people know?
	//        }
	//    }
