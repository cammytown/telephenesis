// import clientState from './ClientState';

/**
 * This class is used by both server and client to
 * work with stars; largely as a centralized
 * data structure.
 */

function Star() {
	var me = this;

	me.identityProps = [
		'id',
		'originStarID',
		'title',
		'x',
		'y',
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

	function init() {
		var allProps = identityProps.concat(serverProps);

		for (var propIndex = 0; propIndex < allProps.length; propIndex++) {
			var prop = allProps[propIndex];
			me[prop] = null;
		}
	}

	me.loadData = function(data, flag = 'client') { ///REVISIT flag architecture
		if(flag == 'client') {
			// Remove keys that the client isn't allowed to modify:

			///TODO maybe more value and type validation?

			var filteredData = {};
			var intProps = ['id', 'originStarID', 'x', 'y']

			for (var propIndex = 0; propIndex < me.identityProps.length; propIndex++) {
				var identityProp = me.identityProps[propIndex];

				if(intProps.indexOf()) {

				}

				filteredData[identityProp] = data[identityProp];
			}

			data = filteredData;
		}
	}

	me.initializeElement = function(domElement) {
		me.element = domElement;

		for (var propIndex = 0; propIndex < me.identityProps.length; propIndex++) {
			var property = me.identityProps[propIndex]
			me[property] = me.element.getAttribute('data-' + property);
		}
	}
}

module.exports = Star;
// export default Star();
