class ServerArtist {
	constructor(data) {
		this.identityProps = [
			'publicID',
			'userPublicID',
			'name',
			'externalLink'
		];

		this.exportProps = {
			client: this.identityProps,
		};

		this.loadData(data, true);
	}

	loadData(data, initializeProps = false) {
		for(var identityProp of this.identityProps) {
			if(data.hasOwnProperty(identityProp)) {
				this[identityProp] = data[identityProp];
			} else {
				if(initializeProps) {
					this[identityProp] = null;
				}
			}
		}
	}

	export(target = 'client') {
		if(!this.exportProps.hasOwnProperty(target)) {
			throw "ServerArtist has no export target named '" + target + "'";
		}

		var exportObject = {};
		for(var exportProp of this.exportProps[target]) {
			exportObject[exportProp] = this[exportProp];
		}

		return exportObject;
	}
}

module.exports = ServerArtist;
