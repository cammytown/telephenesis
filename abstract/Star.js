// import clientState from './ClientState';

/**
 * This class is used by both server and client to
 * work with stars; largely as a centralized
 * data structure.
 * 
 * @constructor
 */
function Star() {
	// PROPERTIES:
	var me = this;

	me.identityProps = [
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

	me.serverProps = [
		'active',
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
