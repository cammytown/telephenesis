/* v0.31
CHANGELOG
	0.31 - added this.check()

TODO
	- don't use if(!$sh->execute()) return false;
	- add a column, "on" for active or not?
	- remove bcrypt param somehow?
*/

module.exports = function(db, vl, bcrypt) {
	var collection;
	// collection = db.collection('usr'); /// safe name?
	collection = db.collection('MLusers'); /// safe name?

	var MLPuserIndex;

	this.grr = false;

	var MLMeta = db.collection('MLMeta'); /// do we need to filter MLMeta?
	MLMeta.find({ id: 'persistors' }).limit(1).next(function(err, persistorDoc) {
		// if(!persistorDoc) {
		// 	// persistorDoc = {}; /// quick-fix
		// 	MLMeta.insertOne({
		// 		id: 'persistors',
		// 		userIndex: 0,
		// 		currentConstellationIndex: 0,
		// 		currentPlanetIndex: 0
		// 	}, function() {
				
		// 	});
		// } else {
			if(persistorDoc.hasOwnProperty("userIndex")) {
				MLPuserIndex = persistorDoc.userIndex;
			} else {
				MLMeta.updateOne({ id: "persistors" }, { $set: { userIndex: 0 } });
			}
		// }
	});

	this.in = function(sessionString, cb) {
		if(!sessionString) {
			if(cb) cb(true, false);
			return Promise.resolve(false); ///
		} else {
			return collection.findOne({ ss: sessionString })
				.then(doc => {
					if(cb) cb(false, doc);
					// resolve(doc);
					return doc;
				})
				.catch(err => {
					// console.log(err);
					// return false;
					throw err;
				});
		}
	}

	this.check = function(em, pw, ip, cb) { /// rename; what is diff between this and validate?
		return validate(em, pw, ip)
			.then(isValid => {
				return collection.findOne({em: em})
					.then(doc => {
						if(!doc) { /// safe check?
							cb("No user with email " + em); ////
							return false;
						}

						var ts = doc.ts;
						var s = sl(em, ts);

						if(!bcrypt.compareSync(pw+s, doc.pw)) {
							errors.push("Invalid email/password combination.");
							cb(errors, doc);
							throw errors;
						}

						cb(false, doc);
						return doc;
					})
					.catch(findErrors => {
						// console.log(findErrors);
						cb(findErrors, doc);
						throw findErrors;
					});
			})
			.catch(errors => {
				if(cb) cb(errors);
				throw errors;
			});
	}

	this.li = function(em, pw, ip, cb, checkOnly) { /// rename checkOnly
		return this.check(em, pw, ip, function(errors, doc) {
			if(errors.length) { /// safe check?
				if(cb) cb(errors);
				return false;
			}

			// var ts = doc.ts;
			// var s = sl(em, ts);
			// var cr = bcrypt.hashSync(pw, s);
			var sessionCode = generateString(16);

			collection.update(
				{ em: em },
				{ $set: { ip: ip, ss: sessionCode } },
				function(err, result) {
					// console.log(err);
					// console.log(result);

					if(cb) cb(errors, sessionCode);
				}
			);
		});
	}

	this.rg = function(em, pw, ip, cb) { /// pass ip here?
		validate(em, pw, ip, function(errors) {
			if(errors.length) {
				cb(errors);
				return false;
			}

			/// s because of function names?
			var ts = Date.now();
			var s = sl(em, ts);
			var cr = bcrypt.hashSync(pw+s, bcrypt.genSaltSync(12)); /// use async? ///// increase rounds?
			var s = generateString(16);

			collection.findOne({em: em}, function(err, doc) {
				if(err) {
					console.log(err);
					return false;
				}

				if(doc) { /// safe check?
					errors.push("DAT EMAIL IS IN USE BRO.");
				}

				if(errors.length) cb(errors);
				else {
					collection.insert({
						id: MLPuserIndex,
						lv: 0,
						em: em,
						pw: cr,
						ip: ip,
						ts: ts,
						ss: s
					}, function(err, results) {
						console.log(results);
						var doc = results[0];
						cb(errors, doc, s); /// separate ss from rg/li?
					});
				}
			});
		});
	}

	function validate(em, pw, ip, cb) {
		var errors = [];

		if(!em.length) { /// safe check?
			errors.push("No email entered.");
		} else if(!vl.isEmail(em)) {
			errors.push("Not a valid email.");
		}

		if(!pw.length) {
			errors.push("Please enter a password.");
		} else if(pw.length < 5) {
			errors.push("Please use a stronger password.");
		}

		if(cb) cb(errors);

		if(errors.length) {
			throw errors;
		}

		return true;
	}

	function sl(em, ts) {
		// console.log('em: '+em);
		// console.log('ts: '+ts);

		// return false;

		var re = ts % 7;
		if(re<2) re = 5 + re; /// have a bunch of modifiers determined psuedorandomly?
		var rn = Math.pow(ts, re/7);

		var r1 = rn.toString();
		var r2 = (rn/7).toString();
		var r3 = ((r2+7)*7).toString();
		var r4 = ((r3+7)*7).toString();

		r1 = r1.replace(".", "7");
		r2 = r2.replace(".", "7");
		r3 = r3.replace(".", "7");
		r4 = r4.replace(".", "7");

		var sl = "";

		for(var i=0, j=r1.length/3; i<j; i++) {
			var cn = 48 + (parseInt(r1.substring(i*3, i*3+3)) % (122-48));
			sl += String.fromCharCode(cn);
		}

		for(var i=0, j=r2.length/3; i<j; i++) {
			var cn = 48 + (parseInt(r2.substring(i*3, i*3+3)) % (122-48));
			sl += String.fromCharCode(cn);
		}

		for(var i=0, j=r3.length/3; i<j; i++) {
			var cn = 48 + (parseInt(r3.substring(i*3, i*3+3)) % (122-48));
			sl += String.fromCharCode(cn);
		}

		for(var i=0, j=r4.length/3; i<j; i++) {
			var cn = 48 + (parseInt(r4.substring(i*3, i*3+3)) % (122-48));
			sl += String.fromCharCode(cn);
		}

		return sl;
	}

	function generateString(length) {
		var s = "";

		function s4() {
			return (Math.floor((1 + Math.random()) * 0x10000)
				.toString(16)
				.substring(1));
		}

		for(var i=0; i<length; i++) {
			s += s4();
		}

		// collection.findOne({ss: s}, function(err, doc) {
		// 	if(err) console.log(err);
		// 	else if(doc) s = ss(length);
		// });

		return s;
	}
}

// public function fg(em) {
// 	$ss = "";
// 	for ($i = 1; $i <= 20; $i++) {
// 		$ss .= rand(0, 22);
// 	}
// 	$sh = $this->pdo->prepare("SELECT * FROM usr WHERE em='em'");
// 	if(!$sh->execute()) { return false; } // couldn't query db
// 	if(!$sh->rowCount()) { $this->grr[] = "couldn't find email"; return false; }
// 	$sh = $this->pdo->prepare("UPDATE usr SET rs='$ss' WHERE em='em'");
// 	if(!$sh->execute()) return false; // couldn't query db

// 	return true;
// }

// public function rs($rs, pw = false, pc = false) {
// 	$sh = $this->pdo->prepare("SELECT * FROM usr WHERE rs='$rs'");
// 	if(!$sh->execute()) return false; // couldn't query db
// 	if(!$sh->rowCount()) return false;

// 	if(pw AND pc) {
// 		if(empty(pw)) $this->grr[] = 'password required';
// 		elseif(pw != pc) $this->grr[] = 'passwords do not match';
// 		if($this->grr) return false;
		
// 		$ts = time();
// 		$cr = $this->cr(em, pw, $ts);
// 		$sh = $this->pdo->prepare("UPDATE usr SET pw='$cr' WHERE rs='$rs'");
// 	}
	
// 	return true;
// }

// exports.lo = function() {
// 	delete i.cookies.usr_ss;
// 	return true;
// }

// private function cr(em, pw, $ts) {
// 	$sl = $this->sl(em, $ts);
// 	$cr = crypt(pw, '$2a$09$'.$sl.'$');
// 	return $cr;
// }

