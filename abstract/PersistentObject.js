/**
 * A class designed to hold and exchange information between various users;
 * i.e. between database and client.
 * @constructor
 **/
function PersistentObject() {
	//var me = this;

	/**
	 * Example:
	 * identityProps = {
	 * 	xPos: 'int',
	 * 	yPos: 'int',
	 * 	publicURI: 'string',
	 * }
	 **/
	this.identityProps = {};

	this.targetProps = {};

	this.import = function(data, source, additionalProps = []) {
		if(!this.targetProps.hasOwnProperty(source)) {
			//@REVISIT
			throw new Error("No importProps for target: " + target);
		}

		var importProps = this.targetProps[target];

		for(var importProp in importProps) {
			var type = importProps[importProp];

			switch(type) {
				case 'int': {
					me[importProp] = parseInt(data[importProp]);
				} break;

				default: {
					console.warn("PersistentObject: unhandled type " + type);

					//@REVISIT only updating if value is not falsey; always? use flag?:
					if(data[importProp]) {
						me[importProp] = data[importProp];
					}
				}
			}
		}

		//@TODO revisit architecture; alternative might be to have
		//PersistentObject have identityProps and targetProps separately;
		//identityProps is an object holding names and types, and targetProps
		//only holds arrays of names; this way we can still reference props and
		//retrieve their types by name:
		for(var additionalProp in additionalProps) {
			me[additionalProp] = data[additionalProp];
		}
	}

	this.export = function(target, additionalProps = []) {
		if(!this.targetProps.hasOwnProperty(target)) {
			//@REVISIT
			throw new Error("No exportProps for target: " + target);
		}

		var exportObject = {};
		//var exportProps = me.targetProps.concat(additionalProps);
		//for(var exportProp of exportProps) {
		var exportProps = this.targetProps[target];
		for(var exportProp in exportProps) {
			//var type = exportProps[exportProp];
			exportObject[exportProp] = this[exportProp];
		}

		//@TODO see common on this architecture in .import()
		for(var additionalProp in additionalProps) {
			exportObject[additionalProp] = this[additionalProp];
		}

		return exportObject;
	}
}

module.exports = PersistentObject;
