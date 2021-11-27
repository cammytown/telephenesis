const Star = require('../../abstract/Star.js');
const Vector = require('../../abstract/Vector.js');

/**
 * Star data structure for server use.
 * @param {object} [starData] - Initialization properties.
 * @param {"client"|"server"} [dataFilter] - Where starData is coming from
 * @extends Star
 * @constructor
 */
//@REVISIT maybe "dataFilter" can just be "trusted" true or false
function ServerStar(starData, dataFilter) {
	var me = this;

	//@REVISIT quick-fix because I don't want it to be in identity props;
	//change once we have different property sets functioning:
	me.uploadURL = null;

	const serverProps = [
		'userPublicID',
		'active',
		'deleted'
	];

	function init(starData, dataFilter) {
		Star.call(me);

		if(starData) {
			if(!dataFilter) {
				throw "No dataFilter provided to ServerStar() constructor";
			}

			me.loadData(starData, dataFilter);
		}

	}

	///REVISIT dataFilter architecture
	me.loadData = function(data, dataFilter = 'client') {
		if(!data) {
			return false;
		}

		//@TODO-4 Remove keys that the client isn't allowed to modify.

		var intProps = ['tier'];

		var importProps = me.identityProps;

		switch(dataFilter) {
			case 'client': {
			} break;

			case 'server': {
				importProps = importProps.concat(serverProps);
			} break;

			default: {
				throw "Unhandled ServerStar data filter '" + dataFilter + '"';
			}
		}

		for(var importProp of importProps) {
			// If property value is an object, convert from presumed string:
			if(me.objectProps.indexOf(importProp) != -1) {
				if(data[importProp] instanceof Object == false) {
					data[importProp] = JSON.parse(data[importProp]);
				}
			}

			if(intProps.indexOf(importProp) != -1) {
				me[importProp] = parseInt(data[importProp]);
			} else if(importProp == 'position') {
				me.position = new Vector(data.position.x, data.position.y);
			} else {
				me[importProp] = data[importProp];
			}
		}
	}

	//@TODO probably replace additionalProps w/ something like dataFilter
	this.export = function(additionalProps = []) {
		var exportObject = {};

		var exportProps = me.identityProps.concat(additionalProps);
		for(var exportProp of exportProps) {
			exportObject[exportProp] = me[exportProp];
		}

		return exportObject;
	}

	init(starData, dataFilter);
}

module.exports = ServerStar;
