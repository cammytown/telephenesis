// v0.045
// CHANGELOG
// 0.045
// - added _()

// var EXPORTED_SYMBOLS = ['al', 'rl', 'ac', 'rc', 'cc'];

export default {
	_,
	relativeToElement,
	relativeToEventTarget,
	al,
	rl,
	ac,
	rc,
	cc
};

function _(selector) {
	if(selector[0] == '#') {
		var elementID = selector.slice(1); // remove '#'

		//// more stuff

		var selectedElement = document.getElementById(elementID);
		if(selectedElement) {
			return selectedElement;
		} else {
			console.log("_() did not find #" + elementID);
			return false;
		}
	} else if(selector[0] == '.') {
		var className = selector.slice(1); // remove '#'

		var selectedElements = document.getElementsByClassName(className);

		return selectedElements;
	}

	return false; ////
}

function relativeToElement(element, vec2) {
	var rect = element.getBoundingClientRect();

	var x = vec2.x - rect.left;
	var y = vec2.y - rect.top;
	return { x, y };
}

function relativeToEventTarget(event) {
	return relativeToElement(
		event.target,
		{
			x: event.clientX,
			y: event.clientY 
		}
	);
}

function al(ele, eve, fnc) {
	if(!ele) return false;
	if(ele.addEventListener) ele.addEventListener(eve, fnc, false);
	else if(ele.attachEvent) ele.attachEvent('on'+eve, fnc)
}

function rl(ele, eve, fnc) {
	if(!ele) return false;
	if(ele.removeEventListener) ele.removeEventListener(eve, fnc, false);
	else if(ele.detachEvent) ele.detachEvent('on'+eve, fnc)
}

function ac(ele, cls) {
	if((' '+ele.className+' ').indexOf(' '+cls+' ') !== -1) return false;
	ele.className += ' '+cls;
}

function rc(ele, cls) {
	if((' '+ele.className+' ').indexOf(' '+cls+' ') === -1) return false;
	ele.className = ele.className.replace(cls, ''); ///
}

function cc(ele, cls) {
	if((' '+ele.className+' ').indexOf(' '+cls+' ') !== -1) return true;
	else return;
}
