const Star = require('../../abstract/Star.js');
const Vector = require('../../abstract/Vector.js');

/**
 * Star data structure for server use.
 * @param {object} [starData] - Initialization properties.
 * @param {"client"|"server"} [dataSourceTarget]
 * @extends Star
 * @constructor
 */
//@REVISIT maybe "dataSourceTarget" can just be "trusted" true or false
function ServerStar(starData, dataSourceTarget) {
	var me = this;

	Star.call(me);

	//@REVISIT quick-fix because I don't want it to be in identity props;
	//change once we have different property sets functioning:
	me.uploadURL = null;

	this.targetProps['server'] = Object.assign(this.targetProps['common'], {
		userPublicID: 'string',
		active: 'bool',
		deleted: 'bool',
		uploadURL: 'string',
		partialPlays: 'int',
		longPlays: 'int',
	});

	init(starData, dataSourceTarget);

	function init(starData, dataSourceTarget) {
		if(starData) {
			//@REVISIT do we need this here? feels sloppy:
			const defaults = {
				'partialPlays': 0,
				'longPlays': 0
			};

			starData = Object.assign(defaults, starData);

			if(!dataSourceTarget) {
				throw new Error("No dataSourceTarget provided to ServerStar() constructor");
			}

			me.import(starData, dataSourceTarget);
		}

	}

	///REVISIT dataSourceTarget architecture
	//me.loadData = function(data, dataFilter = 'client') {
	//    if(!data) {
	//        return false;
	//    }

	//    //@TODO-4 Remove keys that the client isn't allowed to modify.

	//    var intProps = ['tier'];

	//    var importProps = me.identityProps;

	//    switch(dataFilter) {
	//        case 'client': {
	//        } break;

	//        case 'server': {
	//            importProps = importProps.concat(serverProps);
	//        } break;

	//        default: {
	//            throw "Unhandled ServerStar data filter '" + dataFilter + '"';
	//        }
	//    }

	//    for(var importProp of importProps) {
	//        // If property value is an object, convert from presumed string:
	//        if(me.objectProps.indexOf(importProp) != -1) {
	//            if(data[importProp] instanceof Object == false) {
	//                data[importProp] = JSON.parse(data[importProp]);
	//            }
	//        }

	//        if(intProps.indexOf(importProp) != -1) {
	//            me[importProp] = parseInt(data[importProp]);
	//        } else if(importProp == 'position') {
	//            me.position = new Vector(data.position.x, data.position.y);
	//        } else {
	//            me[importProp] = data[importProp];
	//        }
	//    }
	//}

}

module.exports = ServerStar;
