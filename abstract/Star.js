// import clientState from './ClientState';
const PersistentObject = require('./PersistentObject');
const Vector = require('./Vector');

/**
 * This class is used by both server and client to
 * work with stars; largely as a centralized
 * data structure.
 * @constructor
 * @extends PersistentObject
 */
function Star() {
	var me = this;

	PersistentObject.call(me);

	this.targetProps['common'] = {
		'publicID': 'string',
		'originStarID': 'string',
		'constellationID': 'string',
		'title': 'string',
		'position': (data) => { return new Vector(data.position.x, data.position.y) },
		'color': 'string',
		'tier': 'int',
		'artist': 'object',
		'hostType': 'string',
		'file': 'string',
		'fileURL': 'string',
		'timestamp': 'int'
	};

	//@REVISIT:
	this.targetProps['client'] = this.targetProps['common'];

	//this.exportProps = {
	//    'client': this.commonExports,

	//    'database': this.commonExports.concat([
	//        'active',
	//        'deleted',
	//        'uploadURL',
	//        'partialPlays',
	//        'longPlays',
	//    ])
	//};

	init();

	function init() {
		// Initialize common star properties to null:
		for (var propIndex = 0; propIndex < me.targetProps['common'].length; propIndex++) {
			var prop = allProps[propIndex];
			me[prop] = null;
		};

		//var allProps = me.identityProps.concat(me.serverProps);

		//for (var propIndex = 0; propIndex < allProps.length; propIndex++) {
		//    var prop = allProps[propIndex];
		//    me[prop] = null;
		//};
	}

	//this.export = function(target, additionalProps = []) {
	//    var exportObject = {};

	//    if(!this.exportProps.hasOwnProperty(target)) {
	//        //@REVISIT
	//        throw "No exportProps for target: " + target;
	//    }

	//    //var exportProps = me.identityProps.concat(additionalProps);
	//    //for(var exportProp of exportProps) {
	//    for(var exportProp of this.exportProps[target].concat(additionalProps)) {
	//        exportObject[exportProp] = me[exportProp];
	//    }

	//    return exportObject;
	//}
}

module.exports = Star;
// export default Star();
