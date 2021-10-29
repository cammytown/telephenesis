// import clientState from './ClientState';

/**
 * This class is used by both server and client to
 * work with stars; largely as a centralized
 * data structure.
 * 
 * @constructor
 */
function Star() {
	var me = this;

	/**
	 * The properties relevant to import/export methods.
	 * @type {Array}
	 */
	this.identityProps = [
		'id',
		'originStarID',
		'title',
		// 'x',
		// 'y',
		'position',
		'color',
		'tier',
		'creator',
		'constellationID',
		'hostType',
		'fileURL',
		'timestamp'
	];

	this.serverProps = [
		'active',
	];

	this.objectProps = [
		'position'
	];

	init();

	// METHODS:
	function init() {
		var allProps = me.identityProps.concat(me.serverProps);

		for (var propIndex = 0; propIndex < allProps.length; propIndex++) {
			var prop = allProps[propIndex];
			me[prop] = null;
		};
	}
}

module.exports = Star;
// export default Star();
