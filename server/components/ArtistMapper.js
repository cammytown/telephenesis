const ServerArtist = require('./ServerArtist');

class ArtistMapper {
	constructor() {
	}

	initialize(server) {
		this.server = server;
		this.dbArtists = server.db.collection('ArtistIdentities');
		this.dbUsrMeta = server.db.collection('usrMeta');
	}

	/**
	 * Retrieve an artist by their public ID.
	 * @param {string} publicID
	 **/
	getArtist(publicID) {
		return this.dbArtists.findOne({ publicID });
	}

	/**
	 * Create a new artist.
	 * @param {TelepUser} user - The user creating new artist.
	 * @param {object} artistData - Data for new artist.
	 **/
	createArtist(user, artistData) {
		// Check if user already has an artist with matching name:
		//@TODO-3

		// Generate public ID for artist:
		return this.server.generatePublicID(this.dbArtists).then(publicID => {
			//@REVISIT architecture:
			artistData.publicID = publicID;
			artistData.userPublicID = user.publicID;

			// Build an Artist object:
			var newArtist = new ServerArtist(artistData);

			var artistExport = newArtist.export('client');

			// Update usrMeta:
			return this.dbUsrMeta.update(
				{ publicID: user.publicID },
				{ $addToSet: { artists: artistExport } }
			)
				// Insert new artist into database:
				.then(result => this.dbArtists.insertOne(artistExport));

			//return this.dbArtists.insertOne({
			//    publicID,
			//    userPublicID: user.publicID,
			//    name
			//});
		});
	}

	/**
	 * Retrieve artists belonging to user.
	 * @param {string} userPublicID
	 **/
	getUserArtists(userPublicID) {
		//@TODO-2 sort by last used
		return this.dbArtists.find({
			userPublicID
		}).toArray();
	}
}

module.exports = new ArtistMapper();
