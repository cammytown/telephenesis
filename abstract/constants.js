///TODO when node supports export/import keywords

/** @namespace Constants **/

const Constants = {
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
	}
}

//export const ERROR = {

module.exports = Constants;
