// import clientState from './ClientState';

export default new Star();

function Star(domElement) {
	var me = this;

	var identityProps = [
		'id',
		'originStarID',
		'title',
		'x',
		'y',
		'creator',
		'constellation',
		'timestamp'
	];

	me.element = domElement;

	for (var propIndex = 0; propIndex < identityProps.length; propIndex++) {
		var property = identityProps[propIndex]
		me[property] = me.element.getAttribute('data-' + property);
	}
}
