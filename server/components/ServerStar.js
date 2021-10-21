const Star = require('../../abstract/Star.js');
const Vector = require('../../abstract/Vector.js');

/**
 * Star data structure for server use.
 * 
 * @param [starData] {Object} - Initialization properties.
 * @extends Star
 * @constructor
 */
function ServerStar(starData) {
	var me = this;

	function init(starData) {
		Star.call(me);

		me.loadData(starData);
	}

	me.loadData = function(data, flag = 'client') { ///REVISIT flag architecture
		if(!data) {
			return false;
		}

		// if(flag == 'client') {
		// Remove keys that the client isn't allowed to modify:

		///TODO maybe more value and type validation? log when bad values/props are used

		// var filteredData = {};
		var intProps = ['id', 'originStarID', 'x', 'y'];

		for (var propIndex = 0; propIndex < me.identityProps.length; propIndex++) {
			var identityProp = me.identityProps[propIndex];

			if(intProps.indexOf(identityProp) != -1) {
				me[identityProp] = parseInt(data[identityProp]);
			} else if(identityProp == 'position') {
				me.position = new Vector();
			} else {
				me[identityProp] = data[identityProp];
			}
		}

		// data = filteredData;
		// }
	}

	init(starData);
}

module.exports = ServerStar;
