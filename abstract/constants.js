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
		CONSTELLATIONS: "CONSTELLATIONS", ///REVISIT architecture; also both order and view?
		GALAXY: "GALAXY", ///REVISIT do we want this in both order and view or should we choose one?
	},

	/**
	 * Galaxy views.
	 * @readonly
	 * @enum {string}
	 **/
	VIEW: {
		LIST: "LIST",
		GRID: "GRID",
		CONSTELLATIONS: "CONSTELLATIONS", ///REVISIT architecture
		GALAXY: "GALAXY",
	},

	/**
	 * Client page actions.
	 * @readonly
	 * @enum {string}
	 **/
	ACTION: {
		TOGGLE_BOOKMARK: "TOGGLE_BOOKMARK",
		USE_CREATION_TICKET: "USE_CREATION_TICKET",
		USE_RECREATION_TICKET: "USE_RECREATION_TICKET",
	},
}

//export const ERROR = {

module.exports = CONSTANTS;
