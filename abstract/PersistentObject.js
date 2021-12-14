/**
 * A class designed to hold and exchange information between various users;
 * i.e. between database and client.
 * @constructor
 **/
function PersistentObject() {
	var me = this;

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

	this.import = function(data, sourceTarget, additionalProps = []) {
		if(!me.targetProps.hasOwnProperty(sourceTarget)) {
			//@REVISIT
			throw new Error("No importProps for sourceTarget: " + sourceTarget);
		}

		var importProps = this.targetProps[sourceTarget];

		for(var importProp in importProps) {
			var type = importProps[importProp];

			if(typeof type == 'string') {
				switch(type) {
					case 'int': {
						//@REVISIT only parseInt when necessary?
						me[importProp] = parseInt(data[importProp]);
					} break;

					case 'string':
					case 'bool': {
						me[importProp] = data[importProp];
					} break;



					default: {
						console.warn("PersistentObject: unhandled type " + type);

						//@REVISIT only updating if value is not falsey; always? use flag?:
						if(data[importProp]) {
							me[importProp] = data[importProp];
						}
					}
				}
			} else if(typeof type == 'function') {
				if(data.hasOwnProperty(importProp)) {
					me[importProp] = type(data);
				}
			} else {
				console.error("Unhandled type of 'type' property: " + typeof type);
			}
		}

		//@TODO revisit architecture; alternative might be to have
		//PersistentObject have identityProps and targetProps separately;
		//identityProps is an object holding names and types, and targetProps
		//only holds arrays of names; this way we can still reference props and
		//retrieve their types by name:
		for(var additionalProp of additionalProps) {
			me[additionalProp] = data[additionalProp];
		}
	}

	this.export = function(target, additionalProps = []) {
		if(!me.targetProps.hasOwnProperty(target)) {
			//@REVISIT
			throw new Error("No exportProps for target: " + target);
		}

		var exportObject = {};
		//var exportProps = me.targetProps.concat(additionalProps);
		//for(var exportProp of exportProps) {
		var exportProps = this.targetProps[target];
		for(var exportProp in exportProps) {
			//var type = exportProps[exportProp];
			exportObject[exportProp] = me[exportProp];
		}

		//@TODO see common on this architecture in .import()
		for(var additionalProp in additionalProps) {
			exportObject[additionalProp] = me[additionalProp];
		}

		return exportObject;
	}
}

module.exports = PersistentObject;
