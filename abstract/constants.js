/** @namespace CONSTANTS **/

const CONSTANTS = {
	/**
	 * Error codes.
	 * @readonly
	 * @enum {string}
	 **/
	ERROR: {
		/** Represents user attempting to create without tickets. **/
		NO_CREATION_TICKETS: "NO_CREATION_TICKETS",
		/** Represents user attempting to recreate without tickets. **/
		NO_RECREATION_TICKETS: "NO_RECREATION_TICKETS",
	},

	/**
	 * Star ordering methods.
	 * @readonly
	 * @enum {string}
	 **/
	ORDER: {
		MOST_RECENT: "MOST_RECENT",
		MOST_POPULAR: "MOST_POPULAR",
		BOOKMARKS: "BOOKMARKS",
		GALAXY: "GALAXY" ///REVISIT do we want this in both order and view or should we choose one?
	},

	/**
	 * Galaxy views.
	 * @readonly
	 * @enum {string}
	 **/
	VIEW: {
		LIST: "LIST",
		GRID: "GRID",
		GALAXY: "GALAXY",
	}
}

//export const ERROR = {

module.exports = CONSTANTS;
