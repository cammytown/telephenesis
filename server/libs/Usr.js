/* v0.31
CHANGELOG
	0.31 - added this.check()

TODO
	- don't use if(!$sh->execute()) return false;
	- add a column, "on" for active or not?
	- remove bcrypt param somehow?
*/

module.exports = function Usr(db, vl, bcrypt) {
	var me = this;

	/* PROPERTIES: */
	var collection;
	var userCount;

	var MLMeta; ////ARCHITECTURE
	// me.grr = false;

	init();

	function init() {
		collection = db.collection('MLusers');
		MLMeta = db.collection('MLMeta');

		MLMeta.findOne({ id: 'persistors' })
			.then(persistorDoc => {
				 if(!persistorDoc) { ///REVISIT how we do initial server setup
					 // persistorDoc = {}; /// quick-fix
					 return MLMeta.insertOne({
						 id: 'persistors',
						 userCount: 0,
						 currentConstellationIndex: 0,
						 currentPlanetIndex: 0
					 });
				 } else {
					if(persistorDoc.hasOwnProperty("userCount")) {
						userCount = persistorDoc.userCount;
					} else {
						return MLMeta.updateOne({ id: "persistors" }, { $set: { userCount: 0 } });
					}
				 }
			})
			.catch(err => {
				throw err;
			});
	}

	this.in = function(sessionString, callback) {
		if(!sessionString) {
			///REVISIT should this throw an error?
			if(callback) callback(false, false);
			return Promise.resolve(false);
			// throw "No session string provided."; ///
		} else {
			return collection.findOne({ ss: sessionString })
				.then(doc => {
					if(callback) callback(false, doc);

					//if(!doc) {
					//    throw "No user with sessionString.";
					//}

					return doc;
				})
				.catch(error => {
					// console.log(err);
					// return false;
					throw error;
				});
		}
	}

	this.check = function(em, pw, ip, callback) { /// rename; what is diff between this and getInputErrors?
		var inputErrors = getInputErrors(em, pw, ip);
		if(inputErrors.length) {
			throw inputErrors;
		}

		return collection.findOne({em: em})
			.then(doc => {
				if(!doc) { /// safe check?
					if(callback) callback("No user with email " + em); ////
					throw ["No user with email " + em];
				}

				var ts = doc.ts;
				var salt = createSalt(em, ts);

				if(!bcrypt.compareSync(pw + salt, doc.pw)) {
					// errors.push("Invalid email/password combination.");
					if(callback) callback(["Invalid email/password combination."]);
					throw ["Invalid email/password combination."];
				}

				if(callback) callback(false, doc);
				return doc;
			})
			.catch(findErrors => {
				// console.log(findErrors);
				if(callback) callback(findErrors);
				throw findErrors;
			});
	}

	this.li = function(em, pw, ip, callback, checkOnly) { /// rename checkOnly
		return this.check(em, pw, ip)
			.then(userDoc => {
				// var ts = doc.ts;
				// var s = createSalt(em, ts);
				// var cr = bcrypt.hashSync(pw, s);
				var sessionCode = generateString(16);

				return collection.update( ///ARCHITECTURE
					{ em: em },
					{ $set: { ip: ip, ss: sessionCode } }
				)
					.then(success => {
						// Update userDoc with new sessionCode before returning:
						userDoc.ss = sessionCode;
						return userDoc;
					})
			})
			.catch(errors => {
				if(callback) callback(errors);
				throw errors;
			})
	}

	this.rg = function(em, pw, ip, callback) { /// pass ip here?
		var errors = getInputErrors(em, pw, ip);

		if(errors.length) {
			throw errors;
		}

		/// s because of function names?
		var ts = Date.now();
		var salt = createSalt(em, ts);
		var cr = bcrypt.hashSync(pw+salt, bcrypt.genSaltSync(12)); /// use async? ///// increase rounds?
		var sessionCode = generateString(16);

		return collection.findOne({em: em})
			.then(existingUser => {
				if(existingUser) { /// safe check?
					throw ["Email already in use."];
				}

				var usrObject = {
					id: userCount,
					em: em,
					pw: cr,
					ip: ip,
					ts: ts,
					ss: sessionCode
				};

				userCount += 1;
				MLMeta.updateOne({ id: "persistors" }, { $inc: { userCount: 1 } });

				return collection.insertOne(usrObject)
					.then(result => {
						// var doc = result.ops[0];
						if(callback) callback(errors, usrObject); /// separate ss from rg/li?

						return usrObject;
					});
			})
			.catch(errors => {
				if(callback) callback(errors);///
				throw errors;
			});
	}

	function getInputErrors(em, pw, ip, callback) { ///NAMING
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

		if(callback) callback(errors);

		// if(errors.length) {
		// 	throw errors;
		// }

		return errors;
	}

	function createSalt(em, ts) {
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
// 	$sl = $this->createSalt(em, $ts);
// 	$cr = crypt(pw, '$2a$09$'.$sl.'$');
// 	return $cr;
// }

