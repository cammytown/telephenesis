class ArtistMapper {
	constructor() {
	}

	initialize(server) {
		this.server = server;
		this.dbArtists = server.db.collection('ArtistIdentities');
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
	 * @param {string} name - Name of new artist.
	 **/
	createArtist(user, name) {
		// Check if user already has an artist with matching name:
		//@TODO-3

		// Generate public ID for artist:
		return this.server.generatePublicID(this.dbArtists).then(publicID => {
			// Insert new artist into database:
			return this.dbArtists.insertOne({
				publicID,
				userPublicID: user.publicID,
				name
			});
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