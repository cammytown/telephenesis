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
		MOST_RECENT: "most-recent",
		MOST_POPULAR: "most-popular",
		BOOKMARKS: "bookmarks",
		CONSTELLATIONS: "constellations", ///REVISIT architecture; also both order and view?
		GALAXY: "galaxy", ///REVISIT do we want this in both order and view or should we choose one?
	},

	/**
	 * Galaxy views.
	 * @readonly
	 * @enum {string}
	 **/
	VIEW: {
		LIST: "list",
		GRID: "grid",
		CONSTELLATIONS: "constellations", ///REVISIT architecture
		GALAXY: "galaxy",
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
